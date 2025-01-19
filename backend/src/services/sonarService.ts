import { exec } from "node:child_process";
import axios from "axios";
import * as fs from "fs-extra";
import * as path from "node:path";
import git from "simple-git";
import type { Hotspot, Issue, Metric, SonarReport } from "../types/sastScan";

export class SonarService {
	private readonly SONAR_URL: string =
		process.env.SONAR_URL || "http://localhost:9000";
	private readonly SONAR_TOKEN: string =
		process.env.SONAR_TOKEN || "your_sonar_token";

	public getSonarUrl(): string {
		return this.SONAR_URL;
	}

	async cloneRepository(githubUrl: string): Promise<string> {
		const tempDir = `/tmp/${githubUrl.split("/").pop()?.replace(".git", "") || "repo"}`;
		if (fs.existsSync(tempDir)) {
			await fs.remove(tempDir);
		}
		await git().clone(githubUrl, tempDir);
		return tempDir;
	}

	async runSonarScanner(repoName: string, localPath: string): Promise<string> {
		const scannerCommand = `
            docker run --rm --platform linux/amd64 --network sonarqube-network \
            -v ${localPath}:/usr/src \
            sonarsource/sonar-scanner-cli \
            -Dsonar.projectKey=${repoName} \
            -Dsonar.sources=/usr/src \
            -Dsonar.host.url=http://sonarqube:9000 \
            -Dsonar.login=${this.SONAR_TOKEN} \
            -Dsonar.scm.exclusions.disabled=true
        `.trim();

		return new Promise((resolve, reject) => {
			exec(scannerCommand, (error, stdout) => {
				if (error) {
					return reject(
						new Error(`SonarScanner execution failed: ${error.message}`),
					);
				}
				const taskIdMatch = stdout.match(/task\?id=([\w\-]+)/);
				if (taskIdMatch) {
					resolve(taskIdMatch[1]);
				} else {
					reject(new Error("Task ID not found in SonarScanner output."));
				}
			});
		});
	}

	private async waitForTaskCompletion(taskId: string): Promise<void> {
		const taskApiUrl = `${this.SONAR_URL}/api/ce/task?id=${taskId}`;
		const authHeader = `Basic ${Buffer.from(`${this.SONAR_TOKEN}:`).toString("base64")}`;

		while (true) {
			const response = await axios.get(taskApiUrl, {
				headers: { Authorization: authHeader },
			});
			const status = response.data.task.status;

			if (status === "SUCCESS") return;
			if (status === "FAILED") throw new Error("SonarQube task failed.");
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
	}

	private async ensureReportAvailability(projectKey: string): Promise<void> {
		const reportApiUrl = `${this.SONAR_URL}/api/measures/component?component=${projectKey}&metricKeys=bugs`;
		const authHeader = `Basic ${Buffer.from(`${this.SONAR_TOKEN}:`).toString("base64")}`;

		while (true) {
			try {
				const response = await axios.get(reportApiUrl, {
					headers: { Authorization: authHeader },
				});
				if (response.data.component) break;
			} catch {}
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
	}

	async fetchSonarReport(projectKey: string): Promise<SonarReport> {
		const metricsApiUrl = `${this.SONAR_URL}/api/measures/component?component=${projectKey}&metricKeys=bugs,vulnerabilities,code_smells,coverage`;
		const issuesApiUrl = `${this.SONAR_URL}/api/issues/search?componentKeys=${projectKey}`;
		const hotspotsApiUrl = `${this.SONAR_URL}/api/hotspots/search?projectKey=${projectKey}`;
		const authHeader = `Basic ${Buffer.from(`${this.SONAR_TOKEN}:`).toString("base64")}`;

		const [metricsResponse, issuesResponse, hotspotsResponse] =
			await Promise.all([
				axios.get(metricsApiUrl, { headers: { Authorization: authHeader } }),
				axios.get(issuesApiUrl, { headers: { Authorization: authHeader } }),
				axios.get(hotspotsApiUrl, { headers: { Authorization: authHeader } }),
			]);

		const metrics = metricsResponse.data.component.measures.reduce(
			(acc: Record<string, string | number>, measure: Metric) => {
				acc[measure.metric] = measure.value;
				return acc;
			},
			{},
		);

		const issues = issuesResponse.data.issues.map((issue: Issue) => ({
			key: issue.key,
			type: issue.type,
			severity: issue.severity,
			message: issue.message,
			component: issue.component,
			line: issue.line,
		}));

		const hotspots = hotspotsResponse.data.hotspots.map((hotspot: Hotspot) => ({
			key: hotspot.key,
			status: hotspot.status,
			message: hotspot.message,
			vulnerabilityProbability: hotspot.vulnerabilityProbability,
			line: hotspot.line,
		}));

		return { metrics, issues, hotspots };
	}

	async analyzeRepository(githubUrl: string): Promise<SonarReport> {
		console.log(`[DEBUG] Starting analysis for repository: ${githubUrl}`);

		const localPath = await this.cloneRepository(githubUrl);
		const repoName = path.basename(localPath);

		const taskId = await this.runSonarScanner(repoName, localPath);
		await this.waitForTaskCompletion(taskId);
		await this.ensureReportAvailability(repoName);

		console.log(
			"[DEBUG] Fetching the final report after processing is complete.",
		);
		const report = await this.fetchSonarReport(repoName);

		console.log("[DEBUG] Analysis completed successfully.");
		return report;
	}
}
