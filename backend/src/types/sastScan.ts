export interface Hotspot {
	key: string;
	status: string;
	message: string;
	vulnerabilityProbability?: string;
	line?: number;
}

export interface Issue {
	key: string;
	type: string;
	severity: string;
	message: string;
	component: string;
	line?: number;
}

export interface Measure {
	metric: string;
	value: string | number;
}

export type Metric = {
	metric: string;
	value: string | number;
};

export type SonarReport = {
	metrics: Record<string, string | number>;
	issues: Issue[];
	hotspots: Hotspot[];
};
