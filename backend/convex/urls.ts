import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query for fetching scans by userId
export const fetchVUrlsByVId = query({
	args: {
		vulnerabilityId: v.id("vulnerabilities"), // External user ID
	},
	handler: async (ctx, { vulnerabilityId }) => {
		const urls = await ctx.db
			.query("urls")
			.withIndex("by_vulnerabilityId", (q) =>
				q.eq("vulnerabilityId", vulnerabilityId),
			)
			.collect();
		return urls;
	},
});

// Mutation for saving URL details
export const saveUrl = mutation({
	args: {
		vulnerabilityId: v.id("vulnerabilities"),
		url: v.string(),
		method: v.string(),
		riskLevel: v.string(),
	},
	handler: async (ctx, { vulnerabilityId, url, method, riskLevel }) => {
		const now = Date.now();

		// Insert the URL data into the `urls` table
		await ctx.db.insert("urls", {
			vulnerabilityId,
			url,
			method,
			riskLevel,
			updatedAt: now,
		});

		return { success: true };
	},
});
