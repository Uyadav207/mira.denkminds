import type { Context } from "hono";
import { PineconeService } from "../services/pineconeStore";
import { OpenAIService } from "../services/openAI";
import { Document } from "langchain/document";
import type { CVEDocument } from "../types/cve";

export class RAGController {
	private pinecone!: PineconeService;
	private openai = OpenAIService.getInstance();

	constructor() {
		this.init();
	}

	private async init() {
		this.pinecone = await PineconeService.getInstance();
	}

	async loadDocuments(c: Context) {
		try {
			const body = await c.req.json();
			console.log(body);
			const documents = body.documents.map(
				(doc: CVEDocument) =>
					new Document({
						pageContent: JSON.stringify(doc),
						metadata: { id: doc?.CVE_data_meta?.ID },
					}),
			);

			await this.pinecone.addDocuments(documents);
			return c.json({ status: "success", count: documents.length });
		} catch (error) {
			return c.json(
				{ status: "error", message: (error as Error).message },
				500,
			);
		}
	}

	async query(c: Context) {
		try {
			const { question } = await c.req.json();
			const docs = await this.pinecone.similaritySearch(question);
			const context = docs.map((doc) => doc.pageContent).join("\n\n");
			const answer = await this.openai.generateAnswer(context, question);

			return c.json({ answer, context: docs });
		} catch (error) {
			return c.json(
				{ status: "error", message: (error as Error).message },
				500,
			);
		}
	}
}
