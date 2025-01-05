import { Hono } from "hono";
import { ChatController } from "../controllers/chatController";
import { ScanController } from "../controllers/scanController";

const chatRoutes = new Hono();
const chatController = new ChatController();
const scanController = new ScanController();

chatRoutes.post("/message", (c) => chatController.chat(c));
chatRoutes.post("/message/stream", (c) => chatController.chatStream(c));
chatRoutes.post("/scan/summary", (c) => scanController.chat(c));

export { chatRoutes };
