import type { Context } from "hono";
import { ChatService } from "../services/chatService";

export class ScanController {
	private chatService!: ChatService;

	constructor() {
		this.init();
	}

	private async init() {
		this.chatService = await ChatService.getInstance();
	}

	async chat(c: Context) {
		try {
			const { scanResults } = await c.req.json();
			const response = await this.chatService.processScanSummary(scanResults);
			return c.json({ response });
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			return c.json({ status: "error", message: errorMessage }, 500);
		}
	}
}
