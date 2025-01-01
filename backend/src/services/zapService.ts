import type { ZAPAlert } from "../types/zapAlerts";
import axios from "axios";

const ZAP_BASE_URL = process.env.ZAP_BASE_URL || "http://localhost:8080";

const inferCompliance = (cweId: string): Record<string, string[]> => {
	if (!cweId || cweId === "0") {
		return {
			OWASP: ["Uncategorized"],
			PCI_DSS: ["Uncategorized"],
			GDPR: ["Uncategorized"],
			ISO_27001: ["Uncategorized"],
		};
	}

	const compliance: Record<string, string[]> = {};

	if (cweId.startsWith("79")) {
		compliance.OWASP = ["A07:2021 - Cross-Site Scripting"];
	} else if (cweId.startsWith("89")) {
		compliance.OWASP = ["A03:2021 - Injection"];
	} else if (cweId.startsWith("693")) {
		compliance.OWASP = ["A05:2021 - Security Misconfiguration"];
	} else {
		compliance.OWASP = ["Uncategorized"];
	}

	if (cweId.startsWith("79")) {
		compliance.PCI_DSS = ["6.5.7 - Cross-Site Scripting"];
	} else if (cweId.startsWith("89")) {
		compliance.PCI_DSS = ["6.5.1 - SQL Injection"];
	} else {
		compliance.PCI_DSS = ["Uncategorized"];
	}

	compliance.GDPR = ["Article 32 - Security of Processing"];

	compliance.ISO_27001 = ["A.14.1.2"];

	return compliance;
};

export const spiderAndScan = async (
	targetUrl: string,
	complianceStandard: string,
): Promise<{ alerts: ZAPAlert[] }> => {
	try {
		// Start Spidering
		const spiderResponse = await axios.get(
			`${ZAP_BASE_URL}/JSON/spider/action/scan/`,
			{ params: { url: targetUrl, recurse: true } },
		);

		const spiderScanId = spiderResponse.data.scan;
		let spiderProgress = 0;

		while (spiderProgress < 100) {
			const spiderStatus = await axios.get(
				`${ZAP_BASE_URL}/JSON/spider/view/status/`,
				{ params: { scanId: spiderScanId } },
			);
			spiderProgress = Number(spiderStatus.data.status);
			console.log(`Spider Progress: ${spiderProgress}%`);
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}

		const scanResponse = await axios.get(
			`${ZAP_BASE_URL}/JSON/ascan/action/scan/`,
			{ params: { url: targetUrl } },
		);

		const scanId = scanResponse.data.scan;
		let scanProgress = 0;

		while (scanProgress < 100) {
			const scanStatus = await axios.get(
				`${ZAP_BASE_URL}/JSON/ascan/view/status/`,
				{ params: { scanId } },
			);
			scanProgress = Number(scanStatus.data.status);
			console.log(`Scan Progress: ${scanProgress}%`);
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}

		// Fetch Alerts
		const alertsResponse = await axios.get(
			`${ZAP_BASE_URL}/JSON/core/view/alerts/`,
			{ params: { baseurl: targetUrl } },
		);

		const alerts: ZAPAlert[] = alertsResponse.data.alerts || [];

		const enrichedAlerts = alerts
			.map((alert) => {
				const compliance = inferCompliance(alert.cweid);
				return {
					...alert,
					complianceStandard: complianceStandard,
					complianceDetails: compliance[complianceStandard] || [
						"Uncategorized",
					],
				};
			})
			.filter((alert) => alert.complianceDetails[0] !== "Uncategorized");

		return { alerts: enrichedAlerts };
	} catch (error: unknown) {
		throw new Error("Failed to perform spider/scan");
	}
};
