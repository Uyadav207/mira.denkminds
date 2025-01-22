import { OpenAIService } from "./openai";
import { PineconeService } from "./pineconeStore";
import type { ChatCompletionMessageParam } from "openai/resources/chat";
import type { ScanResults, FilteredAlert } from "../types/scan";

interface Document {
	pageContent: string;
}

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

	private createSummaryPrompt(scanResults: ScanResults, type?: string): string {
		const totalVulnerabilities = scanResults.totals;

		// Create risk distribution string
		const riskDistribution = Object.entries({
			Critical: scanResults.totals.critical,
			High: scanResults.totals.high,
			Medium: scanResults.totals.medium,
			Low: scanResults.totals.low,
			Informational: scanResults.totals.informational,
		})
			.map(([level, count]) => `${level}: ${count}`)
			.join(", ");

		// Format findings
		const formattedFindings = scanResults.filteredAlerts
			.map(
				(finding: FilteredAlert, index: number) => `
				${index + 1}. ${finding.name}
				- Risk Level: ${finding.riskdesc}
				- Description: ${finding.desc}
				- Impact: Based on CWE-${finding.cweid}
				- CVEs: ${
					Array.isArray(finding.cve_id) && finding.cve_id.length > 0
						? finding.cve_id.join(", ")
						: "None identified"
				}
				- Solution: ${finding.solution}
				`,
			)
			.join("\n");
		if (type === "detailed") {
			return `
					Generate a vulnerability report based on the following data in Markdown format:

						- URL: ${scanResults.targetUrl}
						- Report Date: ${new Date().toLocaleDateString()}
						- Compliance Standard: ${scanResults.complianceStandardUrl}
						- Total Vulnerabilities: ${totalVulnerabilities}
						- Risk Distribution: ${riskDistribution}

						Detailed Findings:
						${formattedFindings}
						---

						Output format in Markdown:
						# Vulnerability Report

						## Website Name: {applicationName}
						### Report Date: {reportDate}

						---

						## Summary
						This report details vulnerabilities identified during a recent security assessment.

						### Key Findings:
						{keyFindings}

						---

						## Vulnerabilities

						{vulnerabilities}

						---

						## Recommendations
						{recommendations}
`;
		}
		return `	Analyze the following OWASP ZAP security scan results for ${scanResults.targetUrl} and provide a comprehensive security assessment:

						Target Information:
						- URL: ${scanResults.targetUrl}
						- Compliance Standard: ${scanResults.complianceStandardUrl}
						- Total Vulnerabilities: ${totalVulnerabilities}
						- Risk Distribution: ${riskDistribution}

						Detailed Findings:
						${formattedFindings}

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

		const docs: Document[] = await this.pinecone.similaritySearch(message);

		return this.openai.generateRagAnswer(docs, message);
	}

	async processScanSummary(scanResults: ScanResults) {
		const prompt = this.createSummaryPrompt(scanResults);
		const messages: ChatCompletionMessageParam[] = [
			{ role: "system", content: prompt },
		];

		return this.openai.chatStream(messages);
	}

	async generateTitle(botMessage: string): Promise<string> {
		const systemMessage = `Generate a short, concise title maximum 6 words without any quotatations for the following paragraph: ${botMessage}`;

		const messages: ChatCompletionMessageParam[] = [
			{ role: "system", content: systemMessage },
		];

		return this.openai.chat(messages);
	}

	async processMessageStream(message: string, useRAG: boolean) {
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

			return this.openai.chatStream(messages);
		}

		const docs = await this.pinecone.similaritySearch(message);
		const context = docs.map((doc) => doc.pageContent).join("\n\n");
		return this.openai.chatStream([
			{ role: "system", content: `Use this context to answer: ${context}` },
			{ role: "user", content: message },
		]);
	}

	async generateDetailedSummary(scanResult: ScanResults): Promise<string> {
		const prompt = this.createSummaryPrompt(scanResult, "detailed");
		const messages: ChatCompletionMessageParam[] = [
			{ role: "system", content: prompt },
		];
		return this.openai.chat(messages);
	}

	async processChatSummary(messages: string[]) {
		const prompt = messages.join("\n");
		const chatMessages: ChatCompletionMessageParam[] = [
			{
				role: "system",
				content:
					"Generate a summary of the following chat messages in markdown format:",
			},
			{ role: "user", content: prompt },
		];

		return this.openai.chatStream(chatMessages);
	}
}
