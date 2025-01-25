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
	): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
		const formattedContext = this.preprocessContext(documents);
		console.log(formattedContext);

		const stream = await this.client.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [
				{
					role: "system",
					content: `You are a cyber security assistant specializing in CVE analysis. Your task is to:
						1. Analyze the provided CVE data carefully.
						2. For questions about specific CVEs, only use information explicitly stated in the context
						3. If a CVE is not found in the context, clearly state that no information is not yet available or use your knowledge to suggest an answer.
						4. When providing severity or CVSS scores, always cite the specific CVE ID
						5. Include relevant references when available
						6. Format numbers and technical details precisely as they appear in the data
						
						If the user asks for latest CVEs in brief provide the details from the Context:
						If no data can be retrieved, provide a general response about the lack of information or skip accordingly
						
						Please provide:
						1. CVEID: The CVE ID of the vulnerability
						2. Date Published: The date the CVE was published
						3. Description: Human understandable description of the vulnerability
						4. Risk Analysis: Break down the findings by risk level only based on severity.
						5. Remediation Steps: Provide steps if any or use your knowledge to suggest steps

						Format the response in markdown with clear sections and bullet points for readability.

						`,
				},
				{
					role: "user",
					content: `Context:\n${formattedContext}`,
				},
			],
			stream: true,
			temperature: 0.3,
		});

		return stream;
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
