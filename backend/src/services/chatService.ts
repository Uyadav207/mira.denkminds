import { OpenAIService } from "./openAI";
import { PineconeService } from "./pineconeStore";
import type { ChatCompletionMessageParam } from "openai/resources/chat";

export class ChatService {
	private static instance: ChatService;
	private openai: OpenAIService;
	private pinecone: PineconeService;

	constructor(openai: OpenAIService, pinecone: PineconeService) {
		this.openai = openai;
		this.pinecone = pinecone;
	}

	public static async getInstance(): Promise<ChatService> {
		if (!ChatService.instance) {
			const openai = OpenAIService.getInstance();
			const pinecone = await PineconeService.getInstance();
			ChatService.instance = new ChatService(openai, pinecone);
		}
		return ChatService.instance;
	}

	async processMessage(message: string, useRAG: boolean): Promise<string> {
		if (!useRAG) {
			const messages: ChatCompletionMessageParam[] = [
				{
					role: "user",
					content: message,
				},
			];
			return this.openai.chat(messages);
		}

		const docs = await this.pinecone.similaritySearch(message);
		const context = docs.map((doc) => doc.pageContent).join("\n\n");
		return this.openai.generateAnswer(context, message);
	}
}
