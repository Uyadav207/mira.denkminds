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
