import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat";
import type { Stream } from "openai/streaming";

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

	private createSummaryPrompt(scanResults: ScanResults): string {
		return `
				Analyze the following OWASP ZAP security scan results for ${scanResults.targetUrl} and provide a comprehensive security assessment:

				Target Information:
				- URL: ${scanResults.targetUrl}
				- Compliance Standard: ${scanResults.complianceStandard}
				- Total Vulnerabilities: ${scanResults.filteredResults.total_vulnerabilities}
				- Risk Distribution: ${Object.entries(
					scanResults.filteredResults.total_risks,
				)
					.map(([level, count]) => `${level}: ${count}`)
					.join(", ")}

				Detailed Findings:
				${scanResults.filteredResults.findings
					.map(
						(finding, index) => `
				${index + 1}. ${finding.name}
				- Risk Level: ${finding.url_details[0]?.risk_level || "Unknown"}
				- Description: ${finding.description}
				- Impact: Based on CWE-${finding.cwe_id}
				- CVEs: ${finding.cve_ids.length ? finding.cve_ids.join(", ") : "None identified"}
				- Solution: ${finding.solution}
				`,
					)
					.join("\n")}

				Please provide:
				1. Executive Summary: A brief overview of the scan results and their potential business impact
				2. Critical Findings: Highlight the most severe vulnerabilities that require immediate attention
				3. Risk Analysis: Break down the findings by risk level and provide context for each category
				4. Remediation Roadmap: Prioritized list of recommendations with:
				- Immediate actions (24-48 hours)
				- Short-term fixes (1-2 weeks)
				- Long-term security improvements
				5. Technical Details: Include specific CVEs and their implications

				Format the response in markdown with clear sections and bullet points for readability.
				`;
	}

	//normal chat completion

	async chat(messages: ChatCompletionMessageParam[]): Promise<string> {
		const response = await this.client.chat.completions.create({
			model: "gpt-4",
			messages: messages,
		});
		return response.choices[0].message.content || "";
	}

	//rag chat completion

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

	async generateSummary(scanResults: ScanResults): Promise<string> {
		const prompt = this.createSummaryPrompt(scanResults);
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
			model: "gpt-4",
			messages: messages,
			stream: true,
		});
		return stream;
	}
}
