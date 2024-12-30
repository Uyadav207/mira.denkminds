import type { Context } from "hono";
import { ChatService } from "../services/chatService";

export class ChatController {
	private chatService!: ChatService;

	constructor() {
		this.init();
	}

	private async init() {
		this.chatService = await ChatService.getInstance();
	}

	async chat(c: Context) {
		try {
			const { message, useRAG = false } = await c.req.json();
			const response = await this.chatService.processMessage(message, useRAG);
			return c.json({ response });
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			return c.json({ status: "error", message: errorMessage }, 500);
		}
	}
}
