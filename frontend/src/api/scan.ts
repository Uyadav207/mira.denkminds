import type { ScanResult } from "../types/zap-scan";
import axiosInstance from "./axios";

// import data from "../components/chat/testData.json";
interface scanPayload {
	url: string;
	complianceStandard: string;
	scanType: string;
	userId: number;
}

const scan = (payload: scanPayload) =>
	axiosInstance.post("/zap/spider-scan", payload);

const scanWithProgress = async (payload: scanPayload) => {
	// const resultsResponse = axiosInstance.post("/zap/spider-scan", payload);
	const resultsResponse = axiosInstance.post("/zap/baseline-scan", payload);

	return resultsResponse;
};

const scanReportGeneration = async (payload: ScanResult) => {
	const response = await fetch("http://34.60.226.88:8000/chat/scan/summary", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ scanResults: payload }),
	});

	if (!response.body) {
		throw new Error("No response body");
	}

	return response; // Return the readable stream for processing
};

const detailedReportGeneration = async (payload: ScanResult) => {
	const resultsResponse = axiosInstance.post("/chat/detailed/summary", {
		scanResults: payload,
	});

	return resultsResponse;
};

export const scanApis = {
	scan,
	scanWithProgress,
	scanReportGeneration,
	detailedReportGeneration,
};
