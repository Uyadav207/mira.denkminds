import { Hono } from "hono";

import { generateChatResponse } from "../controllers/chatController";

const chatRoute = new Hono();

chatRoute.post("/generate", generateChatResponse);

export { chatRoute };
