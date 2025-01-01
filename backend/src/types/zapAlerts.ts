export interface ZAPAlert {
	pluginId: string;
	cweid: string;
	alert: string;
	description: string;
	url: string;
	risk: string;
	compliance?: Record<string, string[]>;
}
