import type { Context } from "hono";
import { ChatService } from "../services/chatService";

const chatService = new ChatService();

export const generateChatResponse = async (c: Context) => {
	// Parse the request body and ensure correct types
	const { messages, model }: { messages: ChatMessage[]; model: string } =
		await c.req.json();

	try {
		const response = await chatService.generateChat(messages, model);
		return c.json({ response }, 201);
	} catch (error) {
		return c.json({ error: (error as Error).message }, 400);
	}
};
