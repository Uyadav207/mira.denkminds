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

	scans: defineTable({
		userId: v.string(), // Reference to the user
		targetUrl: v.string(),
		complianceStandard: v.string(),
		totalVulnerabilities: v.number(),
		uniqueUrls: v.number(),
		totalRisks: v.object({
			// Object to hold risk levels
			Medium: v.number(),
			High: v.number(),
			Low: v.number(),
			Critical: v.number(),
			Informational: v.number(),
		}),
		createdAt: v.number(),
	}).index("by_userId", ["userId"]),

	vulnerabilities: defineTable({
		scanId: v.id("scans"), // Reference to the scan
		name: v.string(),
		description: v.string(),
		solution: v.string(),
		cweId: v.string(),
		alert: v.string(),
		complianceDetails: v.array(v.string()), // Array of compliance details
		cveIds: v.array(v.string()), // Array of CVE IDs
		createdAt: v.number(),
	}).index("by_scanId", ["scanId"]),

	urls: defineTable({
		vulnerabilityId: v.id("vulnerabilities"), // Reference to the vulnerability
		url: v.string(),
		method: v.string(),
		riskLevel: v.string(), // Medium, High, Low, Critical, etc.
		createdAt: v.number(),
	}).index("by_vulnerabilityId", ["vulnerabilityId"]),
});
