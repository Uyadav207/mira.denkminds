import { Hono } from "hono";
import { RAGController } from "../controllers/ragController";

const rag = new Hono();
const controller = new RAGController();

rag.post("/load-documents", (c) => controller.loadDocuments(c));
rag.post("/query", (c) => controller.query(c));

export { rag };
