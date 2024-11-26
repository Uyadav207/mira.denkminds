import { Hono } from "hono";
import { authRoutes } from "./routes/authRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "hono/logger";

const app = new Hono();

//logger.info
app.use("*", logger());

// Middlewares
app.use("*", errorHandler);

// Routes
app.route("/auth", authRoutes);

export default app;
