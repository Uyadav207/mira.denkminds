import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat";

export class OpenAIService {
	private static instance: OpenAIService;
	private client: OpenAI;

	private constructor() {
		this.client = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
	}

	public static getInstance(): OpenAIService {
		if (!OpenAIService.instance) {
			OpenAIService.instance = new OpenAIService();
		}
		return OpenAIService.instance;
	}

	async chat(messages: ChatCompletionMessageParam[]): Promise<string> {
		const response = await this.client.chat.completions.create({
			model: "gpt-4",
			messages: messages,
		});
		return response.choices[0].message.content || "";
	}

	async generateAnswer(context: string, question: string): Promise<string> {
		const response = await this.client.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a helpful cyber security assistant that answers questions based on the provided context.",
				},
				{
					role: "user",
					content: `Answer the question based only on the following context:\n\n${context}\n\nQuestion: ${question}\nAnswer:`,
				},
			],
		});
		return response.choices[0].message.content || "";
	}
}
