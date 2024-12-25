import { convexClient, api } from "../config/convex"; // Import the convex client and API functions

// Save a summary for a user
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const saveSummaryService = async (
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	userId: any,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	title: any,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	content: any,
) => {
	try {
		const result = await convexClient.mutation(api.summaries.saveSummary, {
			userId,
			title,
			content,
		});
		return result; // Return the result (summary)
	} catch (error) {
		console.error("Error saving summary:", error);
		throw error; // Re-throw error for handling in the controller
	}
};

// Get all summaries by userId
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const getSummariesByUserService = async (userId: any) => {
	try {
		const summaries = await convexClient.query(
			api.summaries.getSummariesByUser,
			{
				userId,
			},
		);
		return summaries; // Return the summaries for the user
	} catch (error) {
		console.error("Error getting summaries:", error);
		throw error;
	}
};

// Delete a summary by summaryId
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const deleteSummaryService = async (summaryId: any) => {
	try {
		const result = await convexClient.mutation(api.summaries.deleteSummary, {
			summaryId,
		});
		return result; // Return success response
	} catch (error) {
		console.error("Error deleting summary:", error);
		throw error;
	}
};
