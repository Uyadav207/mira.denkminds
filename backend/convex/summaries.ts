import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mutation for saving a summary
export const saveSummary = mutation({
	args: {
		userId: v.string(), // External user ID
		title: v.string(), // Title of the summary
		content: v.string(), // Content of the summary
	},
	handler: async (ctx, { userId, title, content }) => {
		const now = Date.now();

		// Insert a new summary into the summaries table
		const result = await ctx.db.insert("summaries", {
			userId,
			title,
			content,
			createdAt: now,
		});

		return result; // Return the created summary (includes auto-generated summaryId)
	},
});

// Query for getting summaries by userId
export const getSummariesByUser = query({
	args: {
		userId: v.string(), // External user ID
	},
	handler: async (ctx, { userId }) => {
		// Query the summaries table to get all summaries for the given userId
		const summaries = await ctx.db
			.query("summaries")
			.filter((q) => q.eq("userId", userId))
			.collect();

		return summaries; // Return all summaries associated with the user
	},
});

// Mutation for deleting a summary by summaryId
export const deleteSummary = mutation({
	args: {
		summaryId: v.id("summaries"), // ID of the summary to delete
	},
	handler: async (ctx, { summaryId }) => {
		// Delete the summary if it exists and matches the userId
		await ctx.db.delete(summaryId);

		return { success: true }; // Return success message
	},
});
