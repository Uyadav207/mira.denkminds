import { HfInference } from "@huggingface/inference";

// Define the ChatMessage type if not already defined
type ChatMessage = {
	role: "user" | "assistant";
	content: string;
};

export class ChatService {
	private inference: HfInference;

	constructor() {
		this.inference = new HfInference(process.env.HUGGINGFACE_API_KEY);
	}

	async generateChat(messages: ChatMessage[], model: string): Promise<string> {
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
			// Handle and log errors
			console.error("Error in generateChat:", error);
			throw new Error("Failed to generate a chat completion");
		}
	}
}
