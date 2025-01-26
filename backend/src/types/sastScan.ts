export interface Hotspot {
	key: string;
	status: string;
	message: string;
	vulnerabilityProbability?: string;
	line?: number;
	component?: string;
}

export type Issue = {
	key: string;
	type: string;
	severity: string;
	message: string;
	component: string;
	line?: number;
	effort?: string;
	tags?: string[];
	author?: string;
	status?: string;
	rule: string | Rule;
};

export interface Measure {
	metric: string;
	value: string | number;
}

export type Metric = {
	metric: string;
	value: string | number;
};

export interface SonarReport {
	metrics: Record<string, string | number>;
	issues: Issue[];
	hotspots: Hotspot[];
}

export type Rule = {
	key: string;
	name: string;
	description: string;
	remediation: {
		func?: string;
		constantCost?: string;
	};
	remediationSteps?: Array<{
		problemCodeSnippet: string;
		remediationCodeSnippet: string;
		description: string;
		context: string;
		content: string;
	}>;
	standards?: Array<{
		name: string;
		link: string;
	}>;
};

export interface DescriptionSection {
	key: string;
	content: string;
	context?: {
		displayName: string;
	};
}

export interface SonarScanReport {
	message: string;
	projectKey: string;
	sonarUrl: string;
	report: {
		metrics: {
			coverage: string;
			bugs: string;
			reliability_rating: string;
			code_smells: string;
			duplicated_lines_density: string;
			security_rating: string;
			ncloc: string;
			vulnerabilities: string;
			security_hotspots_reviewed: string;
			software_quality_maintainability_rating: string;
		};
		issues: Issue[];
		hotspots: Hotspot[];
	};
}