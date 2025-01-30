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

	async chatTitle(c: Context) {
		try {
			const { botMessage } = await c.req.json();
			const response = await this.chatService.generateTitle(botMessage);
			return c.json({ response });
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			return c.json({ status: "error", message: errorMessage }, 500);
		}
	}

	async chatStream(c: Context) {
		try {
			const { message, useRAG, previousMessages = [] } = await c.req.json();
			const stream = await this.chatService.processMessageStream(
				message,
				useRAG,
				previousMessages,
			);

			return new Response(
				new ReadableStream({
					async start(controller) {
						for await (const chunk of stream) {
							const content = chunk.choices[0]?.delta?.content;
							if (content) {
								controller.enqueue(new TextEncoder().encode(content));
							}
						}
						controller.close();
					},
				}),
				{
					headers: {
						"Content-Type": "text/event-stream",
						"Cache-Control": "no-cache",
						Connection: "keep-alive",
					},
				},
			);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			return c.json({ status: "error", message: errorMessage }, 500);
		}
	}

	async chatSummary(c: Context) {
		try {
			const { messages } = await c.req.json();
			const stream = await this.chatService.processChatSummary(messages);
			return new Response(
				new ReadableStream({
					async start(controller) {
						for await (const chunk of stream) {
							const content = chunk.choices[0]?.delta?.content;
							if (content) {
								controller.enqueue(new TextEncoder().encode(content));
							}
						}
						controller.close();
					},
				}),
				{
					headers: {
						"Content-Type": "text/event-stream",
						"Cache-Control": "no-cache",
						Connection: "keep-alive",
					},
				},
			);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			return c.json({ status: "error", message: errorMessage }, 500);
		}
	}
}
