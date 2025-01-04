import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	chats: defineTable({
		userId: v.string(), // External userId as a string
		title: v.string(),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_userId", ["userId"]),

	chatHistory: defineTable({
		chatId: v.id("chats"),
		humanInTheLoopId: v.string(),
		sender: v.union(v.literal("user"), v.literal("ai")),
		message: v.string(),
		createdAt: v.number(),
	}).index("by_chatId", ["chatId"]),

	summaries: defineTable({
		userId: v.string(), // External userId as a string
		title: v.string(),
		content: v.string(),
		createdAt: v.number(),
	}).index("by_userId", ["userId"]),

	reportFolders: defineTable({
		userId: v.string(), // External userId as a string
		folderName: v.string(),
		createdAt: v.number(),
	}).index("by_userId", ["userId"]),

	reports: defineTable({
		folderId: v.id("reportFolders"),
		fileName: v.string(),
		fileUrl: v.string(), // URL for uploaded file
		createdAt: v.number(),
	}).index("by_folderId", ["folderId"]),
});
