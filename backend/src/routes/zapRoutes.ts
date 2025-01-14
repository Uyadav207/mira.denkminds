import { Hono } from "hono";
import { spiderAndScanUrl } from "../controllers/zapController";
import { baselineScanHandler } from "../controllers/baselineScanController";

const zapRoutes = new Hono();

zapRoutes.post("/spider-scan", spiderAndScanUrl);
zapRoutes.post("/baseline-scan", baselineScanHandler);

export { zapRoutes };
