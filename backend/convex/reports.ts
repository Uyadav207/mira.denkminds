import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createReportFolder = mutation({
	args: {
		userId: v.string(), // External user ID
		folderName: v.string(), // Name of the folder
	},
	handler: async (ctx, { userId, folderName }) => {
		const now = Date.now();

		// Insert a new report folder
		const folderId = await ctx.db.insert("reportFolders", {
			userId,
			folderName,
			createdAt: now,
		});

		return folderId; // Return the folder ID
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

		return folders; // Return all report folders for the user
	},
});

export const addReport = mutation({
	args: {
		folderId: v.id("reportFolders"), // ID of the report folder
		fileName: v.string(), // Name of the file
		fileUrl: v.string(), // URL of the uploaded file
	},
	handler: async (ctx, { folderId, fileName, fileUrl }) => {
		const now = Date.now();

		// Insert a new report into the reports table
		const reportId = await ctx.db.insert("reports", {
			folderId,
			fileName,
			fileUrl,
			createdAt: now,
		});

		return reportId; // Return the report ID
	},
});

export const getReportsByFolder = query({
	args: {
		folderId: v.id("reportFolders"), // ID of the report folder
	},
	handler: async (ctx, { folderId }) => {
		// Query reports table by folderId
		const reports = await ctx.db
			.query("reports")
			.withIndex("by_folderId", (q) => q.eq("folderId", folderId))
			.collect();

		return reports; // Return all reports in the folder
	},
});
