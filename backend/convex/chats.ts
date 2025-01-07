import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Save a Chat Message
export const saveChatMessage = mutation({
	args: {
		chatId: v.id("chats"),
		humanInTheLoopId: v.string(),
		sender: v.union(v.literal("user"), v.literal("ai")),
		message: v.string(),
	},
	handler: async (ctx, { chatId, humanInTheLoopId, sender, message }) => {
		const now = Date.now();
		const result = await ctx.db.insert("chatHistory", {
			chatId,
			humanInTheLoopId,
			sender,
			message,
			createdAt: now,
		});

		await ctx.db.patch(chatId, { updatedAt: now });

		return result;
	},
});

// Get Chat History
export const getChatHistory = query({
	args: { chatId: v.optional(v.id("chats")) },
	handler: async (ctx, { chatId }) => {
		if (chatId) {
			const chatHistory = await ctx.db
				.query("chatHistory")
				.withIndex("by_chatId", (q) => q.eq("chatId", chatId))
				.collect();

			return chatHistory;
		}
		return [];
	},
});

// Save a Chat
export const saveChat = mutation({
	args: {
		userId: v.string(),
		title: v.string(),
	},
	handler: async (ctx, { userId, title }) => {
		const now = Date.now();

		const chatId = await ctx.db.insert("chats", {
			userId,
			title,
			createdAt: now,
			updatedAt: now,
		});

		return chatId;
	},
});

// Get chats by userId
export const getChatsByUserId = query({
	args: {
		userId: v.string(),
	},
	handler: async (ctx, { userId }) => {
		const chats = await ctx.db
			.query("chats")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();

		return chats;
	},
});
