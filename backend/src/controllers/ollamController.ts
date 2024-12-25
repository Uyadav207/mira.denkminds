import type { Context } from "hono";
import type { ChatMessage } from "../services/ollamaService";
import { ChatService } from "../services/ollamaService";

export class ChatController {
	private chatService: ChatService;

	constructor() {
		this.chatService = new ChatService();
	}

	async createChatCompletion(c: Context) {
		try {
			const { messages, model } = await c.req.json();

			// Validate input
			if (!messages || !Array.isArray(messages)) {
				return c.json({ error: "Invalid messages format" }, 400);
			}

			const response = await this.chatService.generateChat(
				messages as ChatMessage[],
				model as string,
			);

			return c.json({
				message: response,
			});
		} catch (error) {
			return c.json(
				{
					error:
						error instanceof Error
							? error.message
							: "Unknown error",
				},
				500,
			);
		}
	}
}
