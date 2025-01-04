import type { PrismaClient } from "@prisma/client";
import type { ProcessedSummary } from "../types/zapAlerts";
import { api, convexClient } from "../config/convex";

export class ScanStoreService {
	private prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	async saveZapScanToConvex(
		targetUrl: string,
		complianceStandard: string,
		filteredResults: ProcessedSummary,
		id: number,
	) {
		try {
			const user = await this.prisma.user.findUnique({ where: { id } });
			if (!user) {
				throw new Error("User not found");
			}

			const { total_vulnerabilities, unique_urls, total_risks, findings } =
				filteredResults;
			const { Medium, High, Low, Critical, Informational } = total_risks;
			const scanResponse = await convexClient.mutation(api.scans.saveScan, {
				userId: id.toString(),
				targetUrl,
				complianceStandard,
				totalVulnerabilities: total_vulnerabilities,
				uniqueUrls: unique_urls,
				totalRisks: {
					Medium,
					High,
					Low,
					Critical,
					Informational,
				},
			});

			const scanId = scanResponse.scanId;
			if (!scanId) {
				throw new Error("Failed to save scan data.");
			}

			const vulnerabilityResponse = await Promise.all(
				findings.map(async (finding) => {
					const {
						name,
						total_count,
						description,
						solution,
						cwe_id,
						alert,
						compliance_details,
						cve_ids,
					} = finding;
					return await convexClient.mutation(
						api.vulnerabilities.saveVulnerability,
						{
							scanId,
							name,
							totalCount: total_count,
							description,
							solution,
							cweId: cwe_id,
							alert,
							complianceDetails: compliance_details,
							cveIds: cve_ids,
						},
					);
				}),
			);

			const vulnerabilityIds = vulnerabilityResponse.map(
				(response) => response.vulnerabilityId,
			);

			if (vulnerabilityIds.length !== findings.length) {
				throw new Error("Failed to save vulnerability data.");
			}

			const urlResponse = await Promise.all(
				findings.flatMap((finding, index) => {
					const { url_details } = finding;
					return url_details.map(({ url, method, risk_level }) =>
						convexClient.mutation(api.urls.saveUrl, {
							vulnerabilityId: vulnerabilityIds[index],
							url,
							method,
							riskLevel: risk_level,
						}),
					);
				}),
			);

			if (!urlResponse) {
				throw new Error("Failed to save URL data.");
			}

			return "Scans saved successfully.";
		} catch (error) {
			throw new Error(
				`An error occurred while saving data: ${(error as unknown as Error).message}`,
			);
		}
	}
}
