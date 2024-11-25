import { Hono } from "hono";
import { logger } from "hono/logger";

//Import Routes here
import { testRoute } from "./routes/test";

const app = new Hono();

app.use("*", logger());

//Use Routes here

app.route("/test", testRoute);

export default app;
