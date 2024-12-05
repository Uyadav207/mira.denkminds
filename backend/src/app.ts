import { Hono } from "hono";
import { authRoutes } from "./routes/authRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "hono/logger";
import { userRoutes } from "./routes/userRoutes";
import { cors } from "hono/cors";
import { chatRoute } from "./routes/chatRoute";

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

export default app;
