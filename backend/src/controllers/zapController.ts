import type { Context } from "hono";
import { spiderAndScan } from "../services/zapService";
import { processJsonForSummary } from "../utils/zapScannerUtils/filteredScanOutput";
import { cweToCveMap } from "../utils/zapScannerUtils/cweToCve";
import type { ZAPResponse, alertData } from "../types/zapAlerts";

export const spiderAndScanUrl = async (ctx: Context) => {
	try {
		const { targetUrl, complianceStandard } = (await ctx.req.json()) as {
			targetUrl: string;
			complianceStandard: string;
		};

		if (!targetUrl) {
			return ctx.json({ error: "targetUrl is required" }, 400);
		}
		if (!complianceStandard) {
			return ctx.json({ error: "complianceStandard is required" }, 400); // Use number directly
		}

		const results = (await spiderAndScan(targetUrl, complianceStandard)) as {
			alerts: ZAPResponse[];
		};

		const inputData: alertData = {
			alerts: results.alerts || [],
		};

		const filteredResults = processJsonForSummary(inputData, cweToCveMap);

		return ctx.json(
			{
				targetUrl,
				complianceStandard,
				filteredResults,
			},
			200,
		);
	} catch (error: unknown) {
		if (error instanceof Error) {
			return ctx.json({ error: error.message }, 500);
		}
		return ctx.json({ error: "An unknown error occurred" }, 500);
	}
};
