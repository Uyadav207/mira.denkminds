import { OpenAIService } from "./openai";
import { PineconeService } from "./pineconeStore";
import type { ChatCompletionMessageParam } from "openai/resources/chat";
import type { ScanResults, FilteredAlert } from "../types/scan";
import type { SonarScanReport } from "../types/sastScan";

import { chatStreamSystemPrompt } from "../prompts/systemPromps";

interface Document {
	pageContent: string;
}

interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
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
			TotalIssues: scanResults.totals.totalIssues,
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

					The CWE should be in a link format to the official CWE website.

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
						In bullet points, summarize the most critical vulnerabilities and their count.
						{riskDistribution}

						---

						## Vulnerabilities

						{vulnerabilities}

						---

						## Recommendations
						{recommendations}
`;
		}

		return `	Analyze the following OWASP ZAP security scan results for ${scanResults.targetUrl} and provide a comprehensive security assessment:

					The CWE and CVEs should be in a link format to the official CWE website.
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
						5. Technical Details: Show relevent technical details for each vulnerability and link to the CVE-ID and CWE-ID using cwe.mitre.org and cve.mitre.org

						Format the response in markdown with clear sections and bullet points for readability.			
	`;
	}

	private createSastSummaryPrompt(
		scanResults: SonarScanReport,
		type?: string,
	): string {
		const totalVulnerabilities = scanResults.metrics.vulnerabilities;

		if (type === "detailed") {
			return `
					Generate a vulnerability and code quality report based on the SonarQube scan results in Markdown format::

					# Security Assessment Report

					## Project Overview
					- Project Key: ${scanResults.projectKey}
					- Total Lines of Code: ${scanResults.metrics.ncloc}
					- Scan URL: ${scanResults.sonarUrl}

					## Code Quality Metrics
					### Quantitative Analysis
					- Code Coverage: ${scanResults.metrics.coverage}%
					- Duplicated Lines Density: ${scanResults.metrics.duplicated_lines_density}%
					- Reliability Rating: ${scanResults.metrics.reliability_rating}/5
					- Security Rating: ${scanResults.metrics.security_rating}/5
					- Maintainability Rating: ${scanResults.metrics.software_quality_maintainability_rating}/5

					## Vulnerability Breakdown
					### Identified Issues
					1. Bugs: ${scanResults.metrics.bugs} total
					2. Code Smells: ${scanResults.metrics.code_smells} total
					3. Security Vulnerabilities: ${scanResults.metrics.vulnerabilities} total
					4. Security Hotspots: ${scanResults.hotspots.length}

					## Critical Findings
					### Detailed Vulnerability Analysis

					#### 1. Critical Code Smell: Datetime Handling
					- Location: 
					- Issue: Using datetime.datetime.utcnow()
					- Risk: Potential timezone and timestamp inconsistencies
					- Recommendation: 
					- Replace with datetime.now(timezone.utc)
					- Ensure timezone-aware datetime objects

					#### 2. HTTP Method Security Hotspot
					- Location:
					- Issue: Potential unsafe HTTP method configuration
					- Vulnerability Probability: High
					- Recommendation:
					- Thoroughly review and restrict HTTP methods
					- Implement strict method-level access controls

					#### 3. Resource Integrity Concerns
					- Locations: 
					- Issue: Missing resource integrity checks
					- Vulnerability Probability: Low
					- Recommendation:

					## Remediation Roadmap
					### Immediate Actions (24-48 hours)
					- Refactor datetime methods in auth.py
					- Conduct thorough review of HTTP method configurations

					### Short-term Improvements (1-2 weeks)
					- Increase code coverage
					- Address top priority code smells
					- Implement resource integrity checks

					### Long-term Security Enhancements
					- Comprehensive code refactoring
					- Continuous integration of security best practices
					- Regular vulnerability scanning and remediation

					## Additional Insights
					- Low code coverage suggests extensive testing is required
					- High number of code smells indicates potential technical debt
					- Security ratings suggest a need for proactive security management

					Detailed recommendations and specific code refactoring strategies are provided to address identified vulnerabilities and improve overall code quality.
`;
		}
		return `Analyze the SonarQube security scan results for the ${scanResults.projectKey} project. Provide a comprehensive security assessment:

				1. Overall Code Quality Metrics:
				- Total Lines of Code:  ${scanResults.metrics.ncloc}
				- Code Coverage: ${scanResults.metrics.coverage}%
				- Reliability Rating: ${scanResults.metrics.reliability_rating}
				- Maintainability Rating: ${scanResults.metrics.software_quality_maintainability_rating}

				2. Key Vulnerability Insights:
				- Total Bugs: ${scanResults.metrics.bugs}
				- Total Code Smells: ${scanResults.metrics.code_smells}
				- Security Vulnerabilities: ${scanResults.metrics.vulnerabilities}
				- Security Hotspots: ${scanResults.hotspots.length}

				3. Critical Issues Highlights:
				- Critical Code Smell
				- Potential HTTP method security risk
				- Resource integrity concerns in HTML templates

				4. Immediate Recommendations:
				- Refactor datetime methods to use timezone-aware objects
				- Review HTTP method configurations
				- Implement resource integrity checks

				Deliver a succinct executive summary emphasizing the most critical security and code quality risks.
				Format the response in markdown with clear sections and bullet points for readability.	
`;
	}

	async processScanSummary(scanResults: ScanResults) {
		const prompt = this.createSummaryPrompt(scanResults);
		const messages: ChatCompletionMessageParam[] = [
			{ role: "system", content: prompt },
		];

		return this.openai.chatStream(messages);
	}

	async processSastScanSummary(scanResults: SonarScanReport) {
		const prompt = this.createSastSummaryPrompt(scanResults);
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

	async processMessageStream(
		message: string,
		useRAG: boolean,
		previousMessages: ChatMessage[] = [],
	) {
		if (!useRAG) {
			const messages: ChatCompletionMessageParam[] = [
				{ role: "system", content: chatStreamSystemPrompt },
				...previousMessages,
				{ role: "user", content: message },
			];

			return this.openai.chatStream(messages);
		}

		const docs: Document[] = await this.pinecone.similaritySearch(message);
		console.log(docs);

		return this.openai.generateRagAnswer(docs);
	}
	async generateDetailedSummary(scanResult: ScanResults): Promise<string> {
		const prompt = this.createSummaryPrompt(scanResult, "detailed");
		const messages: ChatCompletionMessageParam[] = [
			{ role: "system", content: prompt },
		];
		return this.openai.chat(messages);
	}

	async generateDetailedSastSummary(
		scanSastResult: SonarScanReport,
	): Promise<string> {
		const prompt = this.createSastSummaryPrompt(scanSastResult, "detailed");
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
