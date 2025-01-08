interface ScanResults {
	targetUrl: string;
	complianceStandard: string;
	filteredResults: {
		total_vulnerabilities: number;
		total_risks: Record<string, number>;
		findings: Array<{
			name: string;
			url_details: Array<{ risk_level: string; url: string }>;
			cve_ids: string[];
			cwe_id: string;
			description: string;
			solution: string;
		}>;
	};
}
