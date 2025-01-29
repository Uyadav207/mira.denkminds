import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveSonarScan = mutation({
	args: {
		userId: v.string(),
		repoType: v.string(),
		projectKey: v.string(),
		metrics: v.optional(
			v.object({
				coverage: v.string(),
				bugs: v.string(),
				reliability_rating: v.string(),
				code_smells: v.string(),
				duplicated_lines_density: v.string(),
				security_rating: v.string(),
				ncloc: v.string(),
				vulnerabilities: v.string(),
				security_hotspots_reviewed: v.string(),
				software_quality_maintainability_rating: v.string(),
			}),
		),
		createdAt: v.number(),
	},
	handler: async (
		ctx,
		{ userId, repoType, projectKey, metrics, createdAt },
	) => {
		const scanId = await ctx.db.insert("staticScans", {
			userId,
			repoType,
			projectKey,
			metrics,
			createdAt,
		});

		return { scanId };
	},
});

export const saveHotspot = mutation({
	args: {
		staticScanId: v.id("staticScans"),
		message: v.string(),
		vulnerabilityProbability: v.string(),
		component: v.string(),
		line: v.number(),
		review_status: v.boolean(),
	},
	handler: async (
		ctx,
		{
			staticScanId,
			message,
			vulnerabilityProbability,
			component,
			line,
			review_status,
		},
	) => {
		const hotspotId = await ctx.db.insert("hotspotList", {
			staticScanId,
			message,
			vulnerabilityProbability,
			component,
			line,
			review_status,
		});

		return { hotspotId };
	},
});

export const saveIssue = mutation({
	args: {
		staticScanId: v.id("staticScans"),
		message: v.string(),
		component: v.string(),
		line: v.number(),
		severity: v.string(),
		tags: v.array(v.string()),
	},

	handler: async (
		ctx,
		{ staticScanId, message, component, line, severity, tags },
	) => {
		const issueId = await ctx.db.insert("issueList", {
			staticScanId,
			message,
			component,
			line,
			severity,
			tags,
		});

		return { issueId };
	},
});

export const saveIssueInfo = mutation({
	args: {
		issueId: v.id("issueList"),
		message: v.string(),
		component: v.string(),
		line: v.number(),
		severity: v.string(),
		rule: v.object({
			key: v.string(),
			name: v.string(),
			remediationSteps: v.array(
				v.object({
					context: v.string(),
					description: v.string(),
					problemCodeSnippet: v.string(),
					remediationCodeSnippet: v.string(),
				}),
			),
		}),
	},
	handler: async (
		ctx,
		{ issueId, message, component, line, severity, rule },
	) => {
		const filteredRule = {
			key: rule.key,
			name: rule.name,
			remediationSteps: rule.remediationSteps.map(
				({
					context,
					description,
					problemCodeSnippet,
					remediationCodeSnippet,
				}) => ({
					context,
					description,
					problemCodeSnippet,
					remediationCodeSnippet,
				}),
			),
		};

		const issueInfoId = await ctx.db.insert("issueInfo", {
			issueId,
			message,
			component,
			line,
			severity,
			rule: filteredRule,
		});

		return { issueInfoId };
	},
});
