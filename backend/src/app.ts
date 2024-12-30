import { Hono } from "hono";

import { authRoutes } from "./routes/authRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "hono/logger";
import { userRoutes } from "./routes/userRoutes";
import { cors } from "hono/cors";
import { chat } from "./routes/chatRoute";
import { rag } from "./routes/rag";

const app = new Hono();

app.use("*", cors());

//logger.info
app.use("*", logger());

// Middlewares
app.use("*", errorHandler);

// Routes
app.route("/auth", authRoutes);
app.route("/users", userRoutes);
app.route("/chat", chat);
app.route("/rag", rag);

const OLLAMA_HOST = "https://35ac-34-16-223-49.ngrok-free.app"; // Change this to your Ollama API URL

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

export default app;
