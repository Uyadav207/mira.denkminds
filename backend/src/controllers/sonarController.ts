import type { Context } from "hono";
import { SonarService } from "../services/sonarService";

export class SonarController {
	private sonarService = new SonarService();

	async scanRepository(c: Context): Promise<Response> {
		try {
			const { githubUrl } = await c.req.json();

			if (!githubUrl) {
				return c.json({ error: "GitHub URL is required" }, 400);
			}

			const repoName =
				githubUrl.split("/").pop()?.replace(".git", "") || "unknown-repo";
			const localPath = `/tmp/${repoName}`;

			await this.sonarService.cloneRepository(githubUrl, localPath);

			await this.sonarService.runSonarScanner(repoName, localPath);

			const report = await this.sonarService.fetchSonarReport(repoName);

			return c.json({
				message: "Scan completed successfully",
				projectKey: repoName,
				sonarUrl: `${this.sonarService.getSonarUrl()}/dashboard?id=${repoName}`,
				report,
			});
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error during repository scan:", error.message);
				return c.json({ error: error.message }, 500);
			}
			console.error("Unknown error during repository scan:", error);
			return c.json({ error: "An unknown error occurred" }, 500);
		}
	}
}
