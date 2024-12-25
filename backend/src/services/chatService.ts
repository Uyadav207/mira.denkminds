import { HfInference } from "@huggingface/inference";
import type { ChatMessage } from "../types/message";

export class ChatService {
	private inference: HfInference;

	constructor() {
		this.inference = new HfInference(process.env.HUGGINGFACE_API_KEY);
	}

	async generateChat(
		messages: ChatMessage[],
		model: string,
	): Promise<string> {
		try {
			const out = await this.inference.chatCompletion({
				model: model,
				messages,
				max_tokens: 500,
			});

			// Extract and return the assistant's response
			const assistantMessage = out.choices?.[0]?.message?.content;
			return assistantMessage || "No response from the model";
		} catch (error) {
			throw new Error(
				`Failed to generate a chat completion: ${(error as unknown as Error).message}`,
			);
		}
	}
}
