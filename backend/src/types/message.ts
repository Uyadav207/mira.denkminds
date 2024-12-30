export interface ChatMessage {
	role: "user" | "assistant";
	content: string;
	useRAG?: boolean;
}
