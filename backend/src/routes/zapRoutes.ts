import { Hono } from "hono";
import { spiderAndScanUrl } from "../controllers/zapController";

const zapRoutes = new Hono();

zapRoutes.post("/spider-scan", spiderAndScanUrl);

export default zapRoutes;
