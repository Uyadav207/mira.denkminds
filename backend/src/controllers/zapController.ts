import type { Context } from "hono";
import { spiderAndScan } from "../services/zapService";

export const spiderAndScanUrl = async (ctx: Context) => {
	try {
		const { targetUrl, complianceStandard } = await ctx.req.json();
		if (!targetUrl) {
			return ctx.json({ error: "targetUrl is required" }, 400);
		}
		if (!complianceStandard) {
			return ctx.json({ error: "complianceStandard is required" }, 400);
		}

		const results = await spiderAndScan(targetUrl, complianceStandard);
		return ctx.json(results);
	} catch (error: unknown) {
		if (error instanceof Error) {
			return ctx.json({ error: error.message }, 500);
		}
		return ctx.json({ error: "An unknown error occurred" }, 500);
	}
};
