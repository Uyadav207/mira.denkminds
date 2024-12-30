import { Hono } from "hono";
import { ChatController } from "../controllers/chatController";

const chat = new Hono();
const controller = new ChatController();

chat.post("/message", (c) => controller.chat(c));

export { chat };
