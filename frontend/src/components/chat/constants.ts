// svg
import GetStarted from "../../assets/GetStarted.svg";
import SummaryIcon from "../../assets/SummaryIcon.svg";
import AnalyseIcon from "../../assets/AnalyseIcon.svg";

const URL_PATTERN = /(https?:\/\/[^\s]+)/g; // Detect URLs
const REPORT_GENERATION = ["summary", "generation", "report", "analysis"];
const NEGATION_PATTERN = /\b(do not|don't|no need to|stop|avoid)\b/i;
const REPORT_KEYWORDS = ["report", "generate report", "summary", "summarize"];
const GREETING_KEYWORDS = ["hello", "hi", "hey", "greetings", "howdy", "hallo"];

const CREATE_FOLDER_ACTION = [
	{
		id: "1",
		name: "Create New Folder",
		type: "folder",
	},
];
const STANDARDS = [
	{
		id: "1",
		name: "NIST",
		type: "scan",
	},
	{
		id: "2",
		name: "ISO",
		type: "scan",
	},
	{
		id: "3",
		name: "GDPR",
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
	CREATE_FOLDER_ACTION,
	STANDARDS,
	REPORTS,
	URL_PATTERN,
	REPORT_GENERATION,
	NEGATION_PATTERN,
	INITIAL_ACTION_CARDS,
	UPDATED_ACTION_CARDS,
	REPORT_KEYWORDS,
	GREETING_KEYWORDS,
};
