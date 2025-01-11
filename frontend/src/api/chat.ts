import axiosInstance from "./axios";
interface ChatPayload {
	message: string;
	useRAG?: boolean;
}

interface ChatOllamaPayload {
	prompt: string;
}

interface ScanPayload {
	website: string;
	selectedStandard: string;
}

const chat = async (payload: ChatPayload) => {
	const response = await fetch("http://localhost:8000/chat/message/stream", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.body) {
		throw new Error("No response body");
	}

	return response; // Return the readable stream for processing
};

const chatOllama = async (payload: ChatOllamaPayload) => {
	const response = await fetch("http://localhost:8000/api/chat", {
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

const scan = (payload: ScanPayload) => axiosInstance.post("/api/scan", payload);

interface GenerateTitlePayload {
	botMessage: string;
}

const generateTitle = (payload: GenerateTitlePayload) =>
	axiosInstance.post("/chat/title", payload);

const chatSummaryOllama = async (payload: { messages: string[] }) => {
	const response = await fetch("http://localhost:8000/api/chat/summary", {
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

const chatSummaryOpenAI = async (payload: { messages: string[] }) => {
	const response = await fetch("http://localhost:8000/chat/chat-summary", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});
	if (!response.body) {
		throw new Error("No response body");
	}

	return response; // Return the readable stream for processing
};

export const chatApis = {
	chatOllama,
	chat,
	scan,
	generateTitle,
	chatSummaryOllama,
	chatSummaryOpenAI,
};
