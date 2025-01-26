import {
	AlertTriangleIcon,
	CheckCircle,
	Code2,
	Lightbulb,
	DockIcon,
	Search,
	Github,
} from "lucide-react";

export const actionCards = [
	{
		title: "Scan a Domain",
		icon: Search,
		useRAG: false,
		color: "text-purple-500",
	},
	{
		title: "Get Cyber Tips ",
		icon: Lightbulb,
		useRAG: false,
		color: "text-yellow-500",
	},
	{
		title: "Latest CVE Updates",
		icon: DockIcon,
		useRAG: true,
		color: "text-red-500",
	},
];

export const moreCards = [
	{
		title: "Defend Against Attacks",
		icon: AlertTriangleIcon,
		useRAG: false,
		color: "text-orange-500",
	},
	{
		title: "Secure Code review",
		icon: Code2,
		useRAG: false,
		color: "text-green-500",
	},
	{
		title: "Secure services hardening",
		icon: CheckCircle,
		useRAG: false,
		color: "text-blue-500",
	},
];
