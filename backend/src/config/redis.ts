import Redis from "ioredis";

const redis = new Redis({
	host: process.env.HOST,
	port: 6379,
});

redis.on("error", (err) => {
	console.error("Redis connection error:", err);
});

redis.on("connect", () => {
	console.log("Connected to Redis");
});

redis.on("reconnecting", () => {
	console.log("Reconnecting to Redis...");
});

redis.on("end", () => {
	console.log("Redis connection closed");
});

export default redis;
