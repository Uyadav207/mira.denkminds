import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { errorHandler } from "./middlewares/errorHandler";
import { authRoutes } from "./routes/authRoutes";
import { chatRoute } from "./routes/chatRoute";
import { userRoutes } from "./routes/userRoutes";
import { reportRoutes } from "./routes/reportRoutes";

import ollama from "ollama";

const app = new Hono();

app.use("*", cors());

//logger.info
app.use("*", logger());

// Middlewares
app.use("*", errorHandler);

// Routes
app.route("/auth", authRoutes);
app.route("/users", userRoutes);
app.route("/chat", chatRoute);
app.route("/reports", reportRoutes);

app.post("/api/chat", async (c) => {
	const { prompt } = await c.req.json();
	const OLLAMA_HOST =
		process.env.OLLAMA_HOST || "https://549f-34-68-57-129.ngrok-free.app";

	try {
		const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt: prompt,
				model: "mistral",
				stream: false,
			}),
		});

		const output = await response.json();
		return c.json({ message: output.response });
	} catch (e) {
		return c.json({ message: e });
	}
});

export default app;
