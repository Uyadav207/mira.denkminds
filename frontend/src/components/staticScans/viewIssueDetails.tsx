import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const ViewIssuesDetails: React.FC = () => {
	const issueDetails = {
		key: "401450b7-23a1-42a2-8380-b3c3c3b3b11e",
		type: "CODE_SMELL",
		severity: "CRITICAL",
		message:
			"Define a constant instead of duplicating this literal 'vulnerabilities/under-construction.html' 8 times.",
		component: "TIWAP:app.py",
		line: 199,
		tags: ["design"],
		rule: {
			key: "python:S1192",
			name: "String literals should not be duplicated",
			description: "No description available",
			remediationSteps: [
				{
					problemCodeSnippet: `def run():
    prepare("action1")  # Noncompliant - "action1" is duplicated 3 times
    execute("action1")
    release("action1")

@app.route("/api/users/", methods=['GET', 'POST', 'PUT'])
def users():
    pass

@app.route("/api/projects/", methods=['GET', 'POST', 'PUT'])  # Compliant - strings inside decorators are ignored
def projects():
    pass`,
					remediationCodeSnippet: `ACTION_1 = "action1"

def run():
    prepare(ACTION_1)
    execute(ACTION_1)
    release(ACTION_1)`,
				},
			],
		},
	};

	return (
		<div>
			<h1 className="text-xl font-bold  mb-4">Issue Details</h1>
			<div className="grid md:grid-cols-2 gap-4">
				{/* Left Section */}
				<div className="bg-sidebar shadow-md p-6 rounded-md">
					<h2 className="text-lg font-semibold  mb-2">Information</h2>
					<p className=" mb-4 text-sm">
						Content Security Policy (CSP) is an added layer of security that
						helps to detect and mitigate certain types of attacks, including
						Cross Site Scripting (XSS) and data injection attacks. These attacks
						are used for everything from data theft to site defacement or
						distribution of malware.
					</p>
				</div>

				{/* Right Section */}
				<div className="bg-sidebar shadow-md p-6 rounded-md">
					<h2 className="text-lg font-semibold  mb-2">
						Assessment Information
					</h2>
					<div className="text-sm  space-y-2">
						<p>
							<span className="font-bold ">Confidence:</span> 3
						</p>
						<p>
							<span className="font-bold ">Cweld:</span> 693
						</p>
						<p>
							<span className="font-bold ">Risk Level:</span> Medium (High)
						</p>
						<p>
							<span className="font-bold ">Identified At:</span> Wed Jan 08 2025
						</p>
					</div>
				</div>
			</div>

			{/* Code Smell Details */}
			<div className="bg-sidebar shadow-md mt-6 p-6 rounded-md">
				<h2 className="text-lg font-semibold mb-4">Code Smell Details</h2>
				<p className=" text-sm mb-4">
					Component: {issueDetails.component} | Line: {issueDetails.line} |
					Severity:{" "}
					<span className="font-bold text-red-500">
						{issueDetails.severity}
					</span>
				</p>

				<div className="mt-4">
					<h3 className="text-md font-semibold mb-2">Problem Code Snippet</h3>
					<div className="bg-sidebar rounded-lg shadow-lg p-4">
						<SyntaxHighlighter
							language="python"
							style={atomDark}
							showLineNumbers
						>
							{issueDetails.rule.remediationSteps[0].problemCodeSnippet}
						</SyntaxHighlighter>
					</div>
				</div>

				<div className="mt-6">
					<h3 className="text-md font-semibold  mb-2">
						Remediation Code Snippet
					</h3>
					<div className="bg-sidebar rounded-lg shadow-lg p-4">
						<SyntaxHighlighter
							language="python"
							style={atomDark}
							showLineNumbers
						>
							{issueDetails.rule.remediationSteps[0].remediationCodeSnippet}
						</SyntaxHighlighter>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewIssuesDetails;
