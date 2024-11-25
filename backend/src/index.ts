import app from "./app";

const server = Bun.serve({
	port: 8080,
	fetch: app.fetch,
});

console.log(`Listening on localhost:${server.port}`);
