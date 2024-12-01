import { Hono } from "hono";
import { authRoutes } from "./routes/authRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "hono/logger";
import { userRoutes } from "./routes/userRoutes";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

//logger.info
app.use("*", logger());

// Middlewares
app.use("*", errorHandler);

// Routes
app.route("/auth", authRoutes);
app.route("/users", userRoutes);

export default app;
