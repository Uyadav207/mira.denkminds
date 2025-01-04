import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query for fetching scans by userId
export const fetchScansByUserId = query({
	args: {
		userId: v.string(), // External user ID
	},
	handler: async (ctx, { userId }) => {
		// Fetch scans by userId from the database
		const scans = await ctx.db
			.query("scans")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();
		return scans;
	},
});

// Mutation for saving scan details
export const saveScan = mutation({
	args: {
		userId: v.string(),
		targetUrl: v.string(),
		complianceStandard: v.string(),
		totalVulnerabilities: v.number(),
		uniqueUrls: v.number(),
		totalRisks: v.object({
			Medium: v.number(),
			High: v.number(),
			Low: v.number(),
			Critical: v.number(),
			Informational: v.number(),
		}),
	},
	handler: async (
		ctx,
		{
			userId,
			targetUrl,
			complianceStandard,
			totalVulnerabilities,
			uniqueUrls,
			totalRisks,
		},
	) => {
		const now = Date.now();

		// Insert the scan data into the `scans` table
		const scanId = await ctx.db.insert("scans", {
			userId,
			targetUrl,
			complianceStandard,
			totalVulnerabilities,
			uniqueUrls,
			totalRisks,
			scanedAt: now,
		});

		return { scanId }; // Return the generated scanId
	},
});
