// svg
import GetStarted from "../../assets/GetStarted.svg";
import SummaryIcon from "../../assets/SummaryIcon.svg";
import AnalyseIcon from "../../assets/AnalyseIcon.svg";

const URL_PATTERN =
	/(?:(?:https?:\/\/)|(?:www\.))?(?:[a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(?:[a-zA-Z]{2,}|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?::\d{1,5})?(?:\/[^\s]*)?/g;
const REPORT_GENERATION = ["summary", "generation", "report", "analysis"];
const NEGATION_PATTERN = /\b(do not|don't|no need to|stop|avoid)\b/i;
const REPORT_KEYWORDS = ["report", "generate report", "summary", "summarize"];
const NEGATION_PATTERNS = [
	/\b(?:not|no|never|none|neither|nor|without|won't|wouldn't|shouldn't|can't|cannot|couldn't|doesn't|didn't|isn't|aren't)\b/i,
	/n't\b/i,
];

const SPECIFIC_REPORT_PATTERN = /^generate a report$/i; // Exact match for "I want to generate a report"

const CLARIFICATION_PATTERNS =
	/\b(difference|compare|how|why|explain|what is|vs|versus)\b/i;

const CREATE_FOLDER_ACTION = [];
const STANDARDS = [
	{
		id: "1",
		name: "OWASP",
		type: "standards",
		description:
			"The National Institute of Standards and Technology (NIST) develops and promotes standards to ensure innovation, security, and industrial competitiveness. It is widely used in cybersecurity frameworks.",
	},
	{
		id: "2",
		name: "PCIDSS",
		type: "standards",
		description:
			"The International Organization for Standardization (ISO) creates globally recognized standards to ensure quality, safety, and efficiency across various industries and sectors.",
	},
	{
		id: "3",
		name: "ISO27001-A",
		type: "standards",
		description:
			"The General Data Protection Regulation (GDPR) is a European Union regulation that governs data privacy and security, ensuring individuals have greater control over their personal data.",
	},
	{
		id: "4",
		name: "NIST CSF",
		type: "standards",
		description:
			"The General Data Protection Regulation (GDPR) is a European Union regulation that governs data privacy and security, ensuring individuals have greater control over their personal data.",
	},
	{
		id: "5",
		name: "GDPR",
		type: "standards",
		description:
			"The General Data Protection Regulation (GDPR) is a European Union regulation that governs data privacy and security, ensuring individuals have greater control over their personal data.",
	},
	{
		id: "6",
		name: "HIPAA",
		type: "standards",
		description:
			"The General Data Protection Regulation (GDPR) is a European Union regulation that governs data privacy and security, ensuring individuals have greater control over their personal data.",
	},
];

const SCANTYPES = [
	{
		id: "1",
		name: "Passive Scan",
		type: "scan",
	},
	{
		id: "2",
		name: "Active Scan",
		type: "scan",
	},
];

const REPORTS = [
	{
		id: "1",
		name: "Chat Summary Report",
		type: "report",
	},
	{
		id: "2",
		name: "Vulnerability Report",
		type: "report",
	},
];

const INITIAL_ACTION_CARDS = [
	{
		title: "Get Started",
		prompt: "Hi, how can I help you today?",
		icon: GetStarted,
	},
	{
		title: "Scan Website",
		prompt: "Please enter the URL to scan.",
		icon: AnalyseIcon,
	},
	{
		title: "Report Generation",
		prompt: "Please select the report type.",
		icon: SummaryIcon,
	},
];

const UPDATED_ACTION_CARDS = [
	{
		title: "Scan Website",
		prompt: "Please enter the URL for analysis.",
		icon: AnalyseIcon,
	},
	{
		title: "Generate Report",
		prompt: "Please select the type of report you need.",
		icon: SummaryIcon,
	},
	{
		title: "Ask Question",
		prompt: "I have a question about...",
		icon: GetStarted,
	},
];

export {
	SPECIFIC_REPORT_PATTERN,
	SCANTYPES,
	CREATE_FOLDER_ACTION,
	STANDARDS,
	REPORTS,
	URL_PATTERN,
	REPORT_GENERATION,
	NEGATION_PATTERN,
	INITIAL_ACTION_CARDS,
	UPDATED_ACTION_CARDS,
	REPORT_KEYWORDS,
	NEGATION_PATTERNS,
	CLARIFICATION_PATTERNS,
};
