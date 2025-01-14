import { exec } from "node:child_process";
import axios from "axios";
import * as fs from "fs-extra";
import * as os from "node:os";
import * as path from "node:path";
import git from "simple-git";
import type { Hotspot, Issue, SonarReport, Metric } from "../types/sastScan";

export class SonarService {
	private readonly SONAR_URL: string =
		process.env.SONAR_URL || "http://localhost:9000";
	private readonly SONAR_TOKEN: string =
		process.env.SONAR_TOKEN || "squ_335615283104aec5296e1d8a396cb31b8a3ca8de";

	public getSonarUrl(): string {
		return this.SONAR_URL;
	}

	/**
	 * Clone the GitHub repository to a temporary directory.
	 * @param githubUrl - URL of the GitHub repository
	 * @returns The path of the temporary directory where the repository is cloned
	 */
	async cloneRepository(githubUrl: string): Promise<string> {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "repo-clone-"));
		try {
			console.log(`Cloning repository from ${githubUrl} to ${tempDir}`);
			await git().clone(githubUrl, tempDir);
			console.log("Repository cloned successfully.");
			return tempDir;
		} catch (error) {
			console.error("Error cloning repository:", error);
			await fs.remove(tempDir);
			throw new Error("Failed to clone repository");
		}
	}

	/**
	 * Run SonarScanner to analyze the cloned repository.
	 * @param repoName - Name of the project repository
	 * @param localPath - Local directory path containing the project
	 */
	async runSonarScanner(repoName: string, localPath: string): Promise<void> {
		const scannerCommand = `
      docker run --rm --platform linux/amd64 --network sonarqube-network \
      -v ${localPath}:/usr/src \
      sonarsource/sonar-scanner-cli \
      -Dsonar.projectKey=${repoName} \
      -Dsonar.sources=/usr/src \
      -Dsonar.host.url=http://sonarqube:9000 \
      -Dsonar.login=${this.SONAR_TOKEN}
    `.trim();
		console.log(scannerCommand, "Docker Command");

		return new Promise((resolve, reject) => {
			console.log(`Running SonarScanner for project: ${repoName}`);
			exec(scannerCommand, (error, stdout, stderr) => {
				if (error) {
					console.error(`SonarScanner Error: ${stderr}`);
					reject(new Error("SonarScanner execution failed"));
				} else {
					console.log("SonarScanner execution completed successfully.");
					resolve();
				}
			});
		});
	}

	/**
	 * Fetch the SonarQube analysis report for the repository.
	 * @param projectKey - Key of the SonarQube project
	 * @returns A JSON object containing metrics, issues, and hotspots
	 */
	async fetchSonarReport(projectKey: string): Promise<SonarReport> {
		const metricsApiUrl = `${this.SONAR_URL}/api/measures/component?component=${projectKey}&metricKeys=bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,ncloc,files,functions,classes,complexity`;
		const issuesApiUrl = `${this.SONAR_URL}/api/issues/search?componentKeys=${projectKey}`;
		const hotspotsApiUrl = `${this.SONAR_URL}/api/hotspots/search?projectKey=${projectKey}`;
		const authHeader = `Basic ${Buffer.from(`${this.SONAR_TOKEN}:`).toString("base64")}`;

		try {
			const [metricsResponse, issuesResponse, hotspotsResponse] =
				await Promise.all([
					axios.get(metricsApiUrl, {
						headers: { Authorization: authHeader },
					}),
					axios.get(issuesApiUrl, { headers: { Authorization: authHeader } }),
					axios.get(hotspotsApiUrl, {
						headers: { Authorization: authHeader },
					}),
				]);

			const metrics: Record<string, string | number> =
				metricsResponse.data.component.measures.reduce(
					(acc: Record<string, string | number>, measure: Metric) => {
						acc[measure.metric] = measure.value;
						return acc;
					},
					{},
				);

			const issues: Issue[] = issuesResponse.data.issues.map(
				(issue: Issue) => ({
					key: issue.key,
					type: issue.type,
					severity: issue.severity,
					message: issue.message,
					component: issue.component,
					line: issue.line,
				}),
			);

			const hotspots: Hotspot[] = hotspotsResponse.data.hotspots.map(
				(hotspot: Hotspot) => ({
					key: hotspot.key,
					status: hotspot.status,
					message: hotspot.message,
					vulnerabilityProbability: hotspot.vulnerabilityProbability,
					line: hotspot.line,
				}),
			);

			return { metrics, issues, hotspots };
		} catch (error) {
			console.error("Error fetching SonarQube report:", error);
			throw new Error("Failed to fetch SonarQube report");
		}
	}
}
