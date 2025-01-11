import { OpenAIService } from "./openai";
import { PineconeService } from "./pineconeStore";
import type { ChatCompletionMessageParam } from "openai/resources/chat";

export class ChatService {
		private static instance: ChatService;
		private openai: OpenAIService;
		private pinecone: PineconeService;

		constructor(openai: OpenAIService, pinecone: PineconeService) {
			this.openai = openai;
			this.pinecone = pinecone;
		}

		public static async getInstance(): Promise<ChatService> {
			if (!ChatService.instance) {
				const openai = OpenAIService.getInstance();
				const pinecone = await PineconeService.getInstance();
				ChatService.instance = new ChatService(openai, pinecone);
			}
			return ChatService.instance;
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

		async processMessage(message: string, useRAG: boolean): Promise<string> {
			if (!useRAG) {
				const systemMessage = `
			You are a cybersecurity assistant specialized in analyzing website vulnerabilities. 
				Your key responsibilities are:
				1. Prompt users for a domain name or URL when they inquire about website security assessments.
				2. If a domain or URL is provided, analyze and return insights on common vulnerabilities, potential risks, and recommendations.
				3. Provide general guidance for cybersecurity-related queries and suggest tools or frameworks for assessments when needed.

				Format the response in markdown with clear sections and bullet points for readability.
			`;

				const messages: ChatCompletionMessageParam[] = [
					{ role: "system", content: systemMessage },
					{ role: "user", content: message },
				];

				return this.openai.chat(messages);
			}

			const docs = await this.pinecone.similaritySearch(message);
			const context = docs.map((doc) => doc.pageContent).join("\n\n");
			return this.openai.generateAnswer(context, message);
		}

		async processScanSummary(scanResults: ScanResults): Promise<string> {
			const prompt = this.createSummaryPrompt(scanResults);
			return this.openai.generateSummary(prompt);
		}

		async processMessageStream(message: string, useRAG: boolean) {
			if (!useRAG) {
				const systemMessage = `
		  You are a cybersecurity assistant specialized in analyzing website vulnerabilities. 
		  // ...existing system message...
		  `;

				const messages: ChatCompletionMessageParam[] = [
					{ role: "system", content: systemMessage },
					{ role: "user", content: message },
				];

				return this.openai.chatStream(messages);
			}

			const docs = await this.pinecone.similaritySearch(message);
			const context = docs.map((doc) => doc.pageContent).join("\n\n");
			return this.openai.chatStream([
				{ role: "system", content: `Use this context to answer: ${context}` },
				{ role: "user", content: message },
			]);
		}

		async processChatSummary(messages: string[]) {
			const prompt = messages.join("\n");
			const chatMessages: ChatCompletionMessageParam[] = [
				{
					role: "system",
					content: "Generate a summary of the following chat messages in markdown format:",
				},
				{ role: "user", content: prompt },
			];

			return this.openai.chatStream(chatMessages);
		}
	}
