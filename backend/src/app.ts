import { Hono } from "hono";

import { cors } from "hono/cors";
// import { chat } from "./routes/chatRoute";
// import { rag } from "./routes/rag";
import { logger } from "hono/logger";
import { errorHandler } from "./middlewares/errorHandler";
import type { Finding, FindingBasline } from "./types/scan";

import { authRoutes } from "./routes/authRoutes";
import { userRoutes } from "./routes/userRoutes";
import { reportRoutes } from "./routes/reportRoutes";
import zapRoutes from "./routes/zapRoutes";
// import { chatRoutes } from "./routes/chatRoute";

const app = new Hono();

app.use("*", cors());

//logger.info
app.use("*", logger());

// Middlewares
app.use("*", errorHandler);

// Routes
app.route("/auth", authRoutes);
app.route("/users", userRoutes);
// app.route("/chat", chatRoutes);
// app.route("/rag", rag);
app.route("/reports", reportRoutes);
app.route("/zap", zapRoutes);

const OLLAMA_HOST = "https://caab-35-230-38-105.ngrok-free.app"; // Change this to your Ollama API URL
app.route("/reports", reportRoutes);

app.post("/api/generate-title", async (c) => {
	try {
		const { initialMessage } = await c.req.json();

		if (!initialMessage) {
			return c.json({ error: "Initial message is required" }, 400);
		}

		const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt: `Generate a short, concise title (max 6 words) for the following conversation: ${initialMessage}`,
				model: "mistral",
				max_tokens: 30,
				stream: false,
			}),
		});

		const result = await response.json();
		const cleanTitle = result.response.replace(/["]/g, "").trim();
		return c.json({
			title: cleanTitle,
			status: "success",
		});
	} catch (e) {
		console.error("Title generation error:", e);
		return c.json(
			{
				error: "Failed to generate title",
				message: (e as Error).message,
			},
			500,
		);
	}
});
//streaming chat response
app.post("/api/chat", async (c) => {
	const { prompt } = await c.req.json();

	try {
		const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt: prompt,
				model: "mistral-cyber",
				stream: true,
			}),
		});

		const reader = response.body?.getReader();
		const decoder = new TextDecoder();
		const stream = new ReadableStream({
			start(controller) {
				function push() {
					reader?.read().then(({ done, value }) => {
						if (done) {
							controller.close();
							return;
						}
						controller.enqueue(decoder.decode(value));
						push();
					});
				}
				push();
			},
		});

		return new Response(stream, {
			headers: { "Content-Type": "text/event-stream" },
		});
	} catch (e) {
		return c.json({ message: e });
	}
});

app.post("/api/summary", async (c) => {
	const { scanResults } = await c.req.json();
	const prompt = `
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
				(finding: Finding, index: number) => `
		${index + 1}. ${finding.name}
		- Risk Level: ${finding.url_details[0]?.risk_level || "Unknown"}
		- Description: ${finding.description}
		- Impact: Based on CWE-${finding.cwe_id}
		- CVEs: ${finding.cve_ids.length ? finding.cve_ids.join(", ") : "None identified"}
		- Solution: ${finding.solution}
		`,
			)
			.join("\n")}
		Format the response in markdown with clear sections and bullet points for readability.

		Please provide:
		1. Executive Summary: A brief overview of the scan results and their potential business impact
		2. Critical Findings: Highlight the most severe vulnerabilities that require immediate attention
		3. Risk Analysis: Break down the findings by risk level and provide context for each category
		4. Remediation Roadmap: Prioritized list of recommendations with:
		- Immediate actions (24-48 hours)
		- Short-term fixes (1-2 weeks)
		- Long-term security improvements
		5. Technical Details: Include specific CVEs and their implications
	`;

	try {
		const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt: prompt,
				model: "mistral-cyber",
				stream: true,
			}),
		});

		const reader = response.body?.getReader();
		const decoder = new TextDecoder();
		const stream = new ReadableStream({
			start(controller) {
				function push() {
					reader?.read().then(({ done, value }) => {
						if (done) {
							controller.close();
							return;
						}
						controller.enqueue(decoder.decode(value));
						push();
					});
				}
				push();
			},
		});

		return new Response(stream, {
			headers: { "Content-Type": "text/event-stream" },
		});
	} catch (e) {
		return c.json({ message: e });
	}
});

app.post("/api/summary/v2", async (c) => {
	const { scanResults } = await c.req.json();
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
			(finding: FindingBasline, index: number) => `
	  ${index + 1}. ${finding.name}
	  - Risk Level: ${finding.riskdesc}
	  - Description: ${finding.desc}
	  - Impact: Based on CWE-${finding.cweid}
	  - CVEs: ${finding.cve_id?.length ? finding.cve_id.split(",").join(", ") : "None identified"}
	  - Solution: ${finding.solution}
	  `,
		)
		.join("\n");

	const prompt = `		
						Analyze the following OWASP ZAP security scan results for ${scanResults.targetUrl} and provide a comprehensive security assessment:

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

	try {
		const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt: prompt,
				model: "mistral-cyber",
				stream: true,
			}),
		});

		const reader = response.body?.getReader();
		const decoder = new TextDecoder();
		const stream = new ReadableStream({
			start(controller) {
				function push() {
					reader?.read().then(({ done, value }) => {
						if (done) {
							controller.close();
							return;
						}
						controller.enqueue(decoder.decode(value));
						push();
					});
				}
				push();
			},
		});

		return new Response(stream, {
			headers: { "Content-Type": "text/event-stream" },
		});
	} catch (e) {
		return c.json({ message: e });
	}
});

app.post("/api/chat/summary", async (c) => {
	const { messages } = await c.req.json();

	const prompt = messages.join("\n");

	try {
		const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt: prompt,
				model: "summary-model",
				stream: true,
			}),
		});

		const reader = response.body?.getReader();
		const decoder = new TextDecoder();
		const stream = new ReadableStream({
			start(controller) {
				function push() {
					reader?.read().then(({ done, value }) => {
						if (done) {
							controller.close();
							return;
						}
						controller.enqueue(decoder.decode(value));
						push();
					});
				}
				push();
			},
		});

		return new Response(stream, {
			headers: { "Content-Type": "text/event-stream" },
		});
	} catch (e) {
		return c.json({ message: e });
	}
});

export default app;
