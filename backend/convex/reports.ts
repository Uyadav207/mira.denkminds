import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createReportFolder = mutation({
	args: {
		userId: v.string(), // External user ID
		folderName: v.string(),
	},
	handler: async (ctx, { userId, folderName }) => {
		const now = Date.now();

		// Insert a new report folder
		const folderId = await ctx.db.insert("reportFolders", {
			userId,
			folderName,
			createdAt: now,
		});

		return folderId;
	},
});

export const getReportFoldersByUser = query({
	args: {
		userId: v.string(), // External user ID
	},
	handler: async (ctx, { userId }) => {
		// Query reportFolders table by userId
		const folders = await ctx.db
			.query("reportFolders")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();

		return folders;
	},
});

export const addReport = mutation({
	args: {
		folderId: v.id("reportFolders"), // ID of the report folder
		fileName: v.string(),
		fileUrl: v.string(),
		markdownContent: v.any(),
	},
	handler: async (ctx, { folderId, fileName, fileUrl, markdownContent }) => {
		const now = Date.now();

		// Insert a new report into the reports table
		const reportId = await ctx.db.insert("reports", {
			folderId,
			fileName,
			fileUrl,
			markdownContent, // Empty content for now
			createdAt: now,
		});

		return reportId;
	},
});

export const getReportsByFolder = query({
	args: {
		folderId: v.optional(v.id("reportFolders")),
	},
	handler: async (ctx, { folderId }) => {
		// Query reports table by folderId
		if (folderId) {
			const reports = await ctx.db
				.query("reports")
				.withIndex("by_folderId", (q) => q.eq("folderId", folderId))
				.collect();

			return reports;
		}
		return [];
	},
});

export const getFileById = query({
	args: {
		fileId: v.id("reports"),
	},
	handler: async (ctx, { fileId }) => {
		const file = await ctx.db.get(fileId);
		if (!file) {
			return null;
		}
		return file;
	},
});
