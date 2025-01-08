import type { Context } from "hono";
import { baselineScanService } from "../services/baselineScanService";
import {
	calculateSeverityCounts,
	calculateTotalIssues,
	filterAlertsByCompliance,
	loadComplianceData,
	isValidUrl,
	checkUrl,
} from "../utils/baselineScanUtils";

export const baselineScanHandler = async (c: Context) => {
	const body = await c.req.json();
	const { url: targetUrl, complianceStandard, scanType } = body;

	if (!targetUrl) {
		return c.json({ error: "URL is required" }, 400);
	}

	if (!isValidUrl(targetUrl)) {
		return c.json({ error: "Invalid URL format." }, 400);
	}

	if (!(await checkUrl(targetUrl))) {
		return c.json({ error: "URL does not exist or is unreachable." }, 404);
	}

	if (!complianceStandard) {
		return c.json({ error: "Compliance standard is required" }, 400);
	}

	if (!scanType) {
		return c.json({ error: "Scan type is required (passive or active)" }, 400);
	}

	try {
		const complianceData =
			complianceStandard !== "all" ? loadComplianceData() : [];

		const result = await baselineScanService(
			targetUrl,
			complianceStandard,
			scanType,
		);

		if (!result.report) {
			return c.json({
				success: false,
				message: "Scan completed, but JSON report was not generated.",
				rawOutput: result.rawOutput,
				rawError: result.rawError,
			});
		}

		const filteredAlerts = filterAlertsByCompliance(
			complianceStandard,
			result.report.site,
			complianceData,
		);

		const severityCounts = calculateSeverityCounts(filteredAlerts);
		const totalIssues = calculateTotalIssues(filteredAlerts);

		return c.json({
			message:
				complianceStandard === "all"
					? "Scan completed successfully. Returning all results."
					: `Scan completed successfully for compliance standard: ${complianceStandard}.`,
			totals: {
				totalIssues,
				...severityCounts,
			},
			complianceStandardUrl: complianceStandard,
			targetUrl,
			filteredAlerts,
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			return c.json({ error: error.message }, 500);
		}
		return c.json({ error: "An unknown error occurred." }, 500);
	}
};
