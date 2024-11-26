import app from "./app";

const server = Bun.serve({
	port: process.env.PORT || 8001,
	fetch: app.fetch,
});
