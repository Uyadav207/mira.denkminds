export interface RemediationStep {
	context: string;
	description: string;
	problemCodeSnippet?: string;
	remediationCodeSnippet?: string;
}

export interface Issue {
	key: string;
	message: string;
	severity: string;
	component: string;
	line: number;
	rule: {
		key: string;
		remediationSteps?: RemediationStep[];
	};
}
