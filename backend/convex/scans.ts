import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query for fetching scans by userId excluding totalRisks
export const fetchScansByUserIdWithoutRisks = query({
	args: {
		userId: v.string(),
	},
	handler: async (ctx, { userId }) => {
		const scans = await ctx.db
			.query("scans")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();
		return scans.map(({ totalRisks, ...rest }) => rest);
	},
});

// Query for fetching totalRisks by userId
export const fetchTotalRisksByUserId = query({
	args: {
		userId: v.string(),
	},
	handler: async (ctx, { userId }) => {
		const scans = await ctx.db
			.query("scans")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();
		return scans.map(({ totalRisks }) => totalRisks);
	},
});

// Mutation for saving scan details
export const saveScan = mutation({
	args: {
		userId: v.string(),
		targetUrl: v.string(),
		complianceStandard: v.string(),
		scanType: v.string(),
		totalRisks: v.object({
			totalVulnerabilities: v.number(),
			Medium: v.number(),
			High: v.number(),
			Low: v.number(),
			Critical: v.number(),
			Informational: v.number(),
		}),
	},
	handler: async (
		ctx,
		{ userId, targetUrl, complianceStandard, totalRisks, scanType },
	) => {
		const scanId = await ctx.db.insert("scans", {
			userId,
			targetUrl,
			complianceStandard,
			totalRisks,
			scanType,
		});

		return { scanId };
	},
});
