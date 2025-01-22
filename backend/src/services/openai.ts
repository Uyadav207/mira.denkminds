import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat";
import type { Stream } from "openai/streaming";

interface Document {
	pageContent: string;
	metadata?: {
		publishedDate?: string;
	};
}

interface CVEDocument {
	id: string;
	description: string;
	references: string;
	cvssScore: number | string;
	severity: string;
	vectorString: string;
	weaknesses: string;
	affectedProducts: string[];
	mitigation: string;
}

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

	//normal chat completion

	async chat(messages: ChatCompletionMessageParam[]): Promise<string> {
		const response = await this.client.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: messages,
		});
		return response.choices[0].message.content || "";
	}

	//rag chat completion

	private preprocessContext(documents: Document[]): string {
		return documents
			.map((doc) => {
				// Parse the JSON string in pageContent
				const cveData: CVEDocument = JSON.parse(doc.pageContent);

				// Create a clean, readable format for the LLM
				return `
					CVE ID: ${cveData.id}
					Description: ${cveData.description}
					Severity: ${cveData.severity}
					CVSS Score: ${cveData.cvssScore}
					Vector String: ${cveData.vectorString}
					Weaknesses: ${cveData.weaknesses}
					References: ${cveData.references}
					Published: ${doc?.metadata?.publishedDate}
	---`;
			})
			.join("\n\n");
	}

	async generateRagAnswer(
		documents: Document[],
		question: string,
	): Promise<string> {
		const formattedContext = this.preprocessContext(documents);

		const response = await this.client.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [
				{
					role: "system",
					content: `You are a cyber security assistant specializing in CVE analysis. Your task is to:
						1. Analyze the provided CVE data carefully
						2. For questions about specific CVEs, only use information explicitly stated in the context
						3. If a CVE is not found in the context, clearly state that no information is available
						4. When providing severity or CVSS scores, always cite the specific CVE ID
						5. Include relevant references when available
						6. Format numbers and technical details precisely as they appear in the data`,
				},
				{
					role: "user",
					content: `Context:\n${formattedContext}\n\nQuestion: ${question}\n\nProvide a detailed answer based solely on the above context.`,
				},
			],
			temperature: 0.3, // Lower temperature for more focused responses
			max_tokens: 500, // Adjust based on your needs
		});

		return response.choices[0].message.content || "Unable to generate response";
	}

	async generateSummary(prompt: string): Promise<string> {
		const response = await this.client.completions.create({
			model: "gpt-4",
			prompt: prompt,
		});
		return response.choices[0].text || "";
	}

	async chatStream(
		messages: ChatCompletionMessageParam[],
	): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
		const stream = await this.client.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: messages,
			stream: true,
		});
		return stream;
	}
}
