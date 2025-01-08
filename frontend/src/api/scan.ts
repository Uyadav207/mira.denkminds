import axiosInstance from "./axios";

interface scanPayload {
	targetUrl: string;
	complianceStandard: string;
	userId: number;
}

const scan = (payload: scanPayload) =>
	axiosInstance.post("/zap/spider-scan", payload);
// const scanSummary = (payload: ScanPayload) =>
// 	axiosInstance.post("/api/scan/summary", payload);

const scanWithProgress = async (
	payload: scanPayload,
	onProgress: (progress: number) => void,
) => {
	let progress = 0;
	const totalSteps = 20; // Simulate 20 steps in the API process
	const resultsResponse = axiosInstance.post("/zap/spider-scan", payload);

	for (let i = 0; i < totalSteps; i++) {
		await new Promise((resolve) => setTimeout(resolve, 500));
		progress += 100 / totalSteps;
		onProgress(Math.min(progress, 100));
	}
	return resultsResponse;
};

const scanReportGeneration = async (payload: string) => {
	const response = await fetch("http://localhost:8000/api/summary", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.body) {
		throw new Error("No response body");
	}

	return response.body; // Return the readable stream for processing
};

export const scanApis = {
	scan,
	scanWithProgress,
	scanReportGeneration,
};
