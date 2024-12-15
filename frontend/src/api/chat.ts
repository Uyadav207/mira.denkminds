import axiosInstance from "./axios";

//login api
interface ChatPayload {
	message: string;
	userId: string;
}

const chat = (payload: ChatPayload) => axiosInstance.post("/api/chat", payload);

export const chatApis = {
	chat,
};
