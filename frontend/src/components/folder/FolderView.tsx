import { useNavigate } from "react-router-dom";
import { FileText, Trash } from "lucide-react";
import { Button } from "@components/ui/button";

export function FolderView({ onBack, files }: { onBack: () => void }) {
	const navigate = useNavigate();

	// const files = [
	// 	{
	// 		id: "1",
	// 		name: "Vulnerability Report -1",
	// 		type: "markdown",
	// 		content: generateVulnerabilityReportMarkdown({
	// 			applicationName: "MyApp",
	// 			reportDate: "January 9, 2025",
	// 			keyFindings: [
	// 				{ severity: "Critical", description: "Cross-Site Scripting (XSS)" },
	// 				{ severity: "High", description: "SQL Injection" },
	// 			],
	// 			vulnerabilities: [
	// 				{
	// 					name: "Cross-Site Scripting (XSS)",
	// 					severity: "Critical",
	// 					description: "Unsanitized user input in the Markdown Viewer.",
	// 					impact:
	// 						"Attackers can execute malicious JavaScript in the browser of other users.",
	// 					recommendation: "Sanitize user-generated markdown using DOMPurify.",
	// 				},
	// 				{
	// 					name: "SQL Injection",
	// 					severity: "High",
	// 					description: "Login endpoint vulnerable to SQL Injection.",
	// 					impact:
	// 						"Attackers can bypass authentication or extract sensitive data.",
	// 					recommendation:
	// 						"Use parameterized queries or ORM frameworks for database access.",
	// 				},
	// 			],
	// 			recommendations: [
	// 				"Sanitize all user inputs.",
	// 				"Implement parameterized queries.",
	// 				"Conduct regular security assessments.",
	// 			],
	// 		}),
	// 		modified: "Jan 9, 2025",
	// 	},
	// 	{
	// 		id: "2",
	// 		name: "Chat Summary Report",
	// 		type: "markdown",
	// 		content: "# Chat Summary\n\nThis is a placeholder for a chat summary.",
	// 		modified: "Jan 5, 2025",
	// 	},
	// ];

	return (
		<div className="p-4">
			<Button
				variant="outline"
				onClick={() => navigate("/reports")}
				className="mb-4"
			>
				Back to Folders
			</Button>

			<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
				<div className="overflow-x-auto">
					<table className="table-auto w-full text-left">
						<thead>
							<tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
								<th className="p-3">Name</th>
								<th className="p-3">Created on</th>
								<th className="p-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{files &&
								files.map((file) => (
									<tr
										key={file._id}
										className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
										onClick={() =>
											navigate(`/file/${file._id}`, {
												state: { file },
											})
										}
									>
										<td className="p-3 flex items-center gap-3">
											<FileText className="h-6 w-6 text-blue-500" />
											<span className="truncate dark:text-gray-100">
												{file.fileName}
											</span>
										</td>
										<td className="p-3 text-gray-600 dark:text-gray-400">
											{/* {new Date(file.createdAt)} */}
										</td>
										<td className="p-3 text-right">
											<Button size="sm" variant="ghost">
												<Trash className="h-5 w-5" />
											</Button>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

// Dynamic Markdown Report Generator Function
const generateVulnerabilityReportMarkdown = ({
	applicationName,
	reportDate,
	keyFindings,
	vulnerabilities,
	recommendations,
}) => `
# Vulnerability Report

## Website Name: ${applicationName}
### Report Date: ${reportDate}

---

## Summary
This report details vulnerabilities identified during a recent security assessment.

### Key Findings:
${keyFindings.map((finding) => `- **${finding.severity}**: ${finding.description}`).join("\n")}

---

## Vulnerabilities

${vulnerabilities
	.map(
		(vulnerability, index) => `
### ${index + 1}. ${vulnerability.name}
**Severity**: ${vulnerability.severity}  
**Description**: ${vulnerability.description}  

**Impact**:  
${vulnerability.impact}

**Recommendation**:  
${vulnerability.recommendation}
`,
	)
	.join("\n")}

---

## Recommendations
${recommendations.map((rec) => `- ${rec}`).join("\n")}



`;
