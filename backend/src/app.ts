import { Hono } from "hono";

import { cors } from "hono/cors";
// import { chat } from "./routes/chatRoute";
// import { rag } from "./routes/rag";
import { logger } from "hono/logger";
import { errorHandler } from "./middlewares/errorHandler";

import { authRoutes } from "./routes/authRoutes";
import { userRoutes } from "./routes/userRoutes";
import { reportRoutes } from "./routes/reportRoutes";
import zapRoutes from "./routes/zapRoutes";
// import { chatRoute } from "./routes/chatRoute";

const app = new Hono();

app.use("*", cors());

//logger.info
app.use("*", logger());

// Middlewares
app.use("*", errorHandler);

// Routes
app.route("/auth", authRoutes);
app.route("/users", userRoutes);
// app.route("/chat", chat);
// app.route("/rag", rag);
app.route("/reports", reportRoutes);
app.route("/zap", zapRoutes);

const OLLAMA_HOST = "https://b2dc-34-148-150-106.ngrok-free.app"; // Change this to your Ollama API URL
// app.route("/chat", chatRoute);
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
app.post("/api/chat/summary", async (c) => {
	const { messages } = await c.req.json();
	console.log("Messages:", messages);
	try {
		// Format the chat history into a single string for processing
		const chatHistory = messages
			.map((msg) => {
				const role = msg.sender === "user" ? "User" : "Assistant";
				return `${role}: ${msg.message}`;
			})
			.join("\n");

		// Create the prompt for summarization
		const prompt = `Please provide a summary of the following chat conversation:\n\n${chatHistory}`;
		console.log("Prompt:", prompt);
		const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
			
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt: prompt,
				model: "summary-model", // Use the custom model we defined
				stream: false,
				
			}),
		});

		const output = await response.json();

		// Format the response
		return c.json({
			summary: output.response,
			originalMessageCount: messages.length,
			timestamp: new Date().toISOString(),
		});
	}
	catch (e) {
		console.error("Error generating summary:", e);
		return c.json(
			{
				error: "Failed to generate summary",
				details: e.message,
			},
			500,
		);
	}
});
export default app;
