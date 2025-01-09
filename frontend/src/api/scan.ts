import type { ScanResult } from "../types/zap-scan";
import axiosInstance from "./axios";

interface scanPayload {
	url: string;
	complianceStandard: string;
	scanType: string;
	userId: number;
}

const scan = (payload: scanPayload) =>
	axiosInstance.post("/zap/spider-scan", payload);

const scanWithProgress = async (
	payload: scanPayload,
	onProgress: (progress: number) => void,
) => {
	let progress = 0;
	const totalSteps = 20; // Simulate 20 steps in the API process
	// const resultsResponse = axiosInstance.post("/zap/spider-scan", payload);
	const resultsResponse = axiosInstance.post("/zap/baseline-scan", payload);

	for (let i = 0; i < totalSteps; i++) {
		await new Promise((resolve) => setTimeout(resolve, 500));
		progress += 100 / totalSteps;
		onProgress(Math.min(progress, 100));
	}
	return resultsResponse;
};

const scanReportGeneration = async (payload: ScanResult) => {
	const response = await fetch("http://localhost:8000/api/summary/v2", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ scanResults: payload }),
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
