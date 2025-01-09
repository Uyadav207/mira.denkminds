export interface ScanResults {
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

export interface Finding {
	name: string;
	url_details: { risk_level: string }[];
	description: string;
	cwe_id: number;
	cve_ids: string[];
	solution: string;
}

export interface FindingBasline {
	name: string;
	url_details: { risk_level: string }[];
	riskdesc: string;
	desc: string;
	cwe_id: number;
	cweid: string;
	cve_id: string;
	solution: string;
}
