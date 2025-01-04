import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query for fetching scans by userId
export const fetchVulnerabilityByScanId = query({
	args: {
		scanId: v.id("scans"), // External user ID
	},
	handler: async (ctx, { scanId }) => {
		const vulnerabilites = await ctx.db
			.query("vulnerabilities")
			.withIndex("by_scanId", (q) => q.eq("scanId", scanId))
			.collect();
		return vulnerabilites;
	},
});

// Mutation for saving vulnerability details
export const saveVulnerability = mutation({
	args: {
		scanId: v.id("scans"),
		name: v.string(),
		description: v.string(),
		totalCount: v.number(),
		solution: v.string(),
		cweId: v.string(),
		alert: v.string(),
		complianceDetails: v.array(v.string()),
		cveIds: v.array(v.string()),
	},
	handler: async (
		ctx,
		{
			scanId,
			name,
			description,
			solution,
			cweId,
			alert,
			complianceDetails,
			cveIds,
		},
	) => {
		const now = Date.now();

		// Insert the vulnerability data into the `vulnerabilities` table
		const vulnerabilityId = await ctx.db.insert("vulnerabilities", {
			scanId,
			name,
			description,
			solution,
			cweId,
			alert,
			complianceDetails,
			cveIds,
			updatedAt: now,
			totalCount: 0,
		});

		return { vulnerabilityId }; // Return the generated vulnerabilityId
	},
});
