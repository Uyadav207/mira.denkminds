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
	{ title: "Scan a Domain", icon: Search, useRAG: false },
	{ title: "Scan Github URL ", icon: Github, useRAG: false },
	{ title: "Latest CVE Updates", icon: DockIcon, useRAG: true },
];

export const moreCards = [
	{ title: "Defend Against Attacks", icon: AlertTriangleIcon, useRAG: false },
	{ title: "Secure Code review", icon: Code2, useRAG: false },
	{ title: "Secure services hardening", icon: CheckCircle, useRAG: false },
	{ title: "Get Cyber Tips ", icon: Lightbulb, useRAG: false },
];
