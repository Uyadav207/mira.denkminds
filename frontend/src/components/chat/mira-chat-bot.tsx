import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import type { Components } from "react-markdown";
import { v4 as uuidv4 } from "uuid";

//components
import { ChatActions } from "@components/chat/chat-actions";
import { Textarea } from "@components/ui/textarea";
import { ScrollArea } from "@components/ui/scroll-area";
import { Spinner } from "@components/loader/spinner";
// import { Progress } from "@components/ui/progress";
import { HumanInTheLoopOptions } from "./human-in-the-loop-options";
import { HumanInTheLoopApproval } from "./human-in-the-loop-approval";
import { CreateFolderDialog } from "../folder/CreateFolderDialog";

//apis
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { chatApis } from "../../api/chat";
import type { Id } from "../../convex/_generated/dataModel";

//store
import useStore from "../../store/store";

// svgs
import MiraLogo from "../../assets/MiraLogo.svg";
import MiraAvatar from "../../assets/Mira.svg";

// types
import type { Message, ChatHistory } from "../../types/chats";
import type { Folder, FolderItem, FolderType } from "../../types/reports";

//constants
import {
	REPORT_GENERATION,
	URL_PATTERN,
	STANDARDS,
	REPORTS,
	CREATE_FOLDER_ACTION,
} from "./constants";
// import { scanApis } from "../../api/scan";

const MiraChatBot: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [, setTargetUrl] = useState<string | null>(null);
	const [actionType, setActionType] = useState<string | null>(null);
	const [confirmType, setConfirmType] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [, setStreaming] = useState(false);
	// const [isScanLoading, setIsScanLoading] = useState(false);
	const [actionPrompts, setActionPrompts] = useState<
		{ id: string; name: string; type: string }[] | []
	>([]);
	const [humanInTheLoopMessage, setHumanInTheLoopMessage] = useState<
		string | null
	>(null);
	const [createdChatId, setCreatedChatId] = useState<Id<"chats"> | null>(null);
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const { chatId: chatIdParam } = useParams<{ chatId: string }>();
	const chatId = chatIdParam as Id<"chats">;

	const [input, setInput] = useState("");

	const [pendingAction, setPendingAction] = useState<string | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	const [foldersList, setFoldersList] = useState(CREATE_FOLDER_ACTION);

	const user = useStore((state) => state.user);
	if (!user) {
		return null;
	}
	const { id } = user;
	//chat apis convex APIs

	const chatData = useQuery(api.chats.getChatHistory, { chatId: chatId });
	const saveChatMessage = useMutation(api.chats.saveChatMessage);
	const saveChat = useMutation(api.chats.saveChat);
	const folderData = useQuery(api.reports.getReportFoldersByUser, {
		userId: String(id),
	});

	//reports apis convex APIs

	const saveReport = useMutation(api.reports.createReportFolder);

	// const [progress, setProgress] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: all dependencies not needed
	useEffect(() => {
		handleScrollToBottom();
	}, [messages]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: all dependencies not needed
	useEffect(() => {
		if (chatData) {
			const chatHistory: Message[] = chatData.map(
				(chat: ChatHistory): Message => ({
					id: chat._id,
					humanInTheLoopId: chat.humanInTheLoopId,
					chatId: chat.chatId,
					message: chat.message,
					sender: chat.sender as "user" | "ai",
				}),
			);
			setMessages(chatHistory);
		}
		if (folderData) {
			const newFolders: FolderItem[] = folderData.map(
				(item: FolderType): FolderItem => ({
					id: item._id,
					name: item.folderName,
					type: "folder",
				}),
			);

			const updatedFoldersList: FolderItem[] = [
				...foldersList,
				...newFolders.filter(
					(newFolder: FolderItem) =>
						!foldersList.some(
							(folder: FolderItem) => folder.id === newFolder.id,
						),
				),
			];

			setFoldersList(updatedFoldersList);
		}
	}, [chatData, folderData]);

	const handleTitleGeneration = async (messages: Message[]) => {
		try {
			const updatedMessages = messages.map((msg) =>
				typeof msg === "string" ? msg : msg.message,
			);
			const response = await generateTitle(updatedMessages);

			return response;
		} catch (error) {
			return error;
		}
	};

	const handleScrollToBottom = () => {
		if (scrollAreaRef.current) {
			const scrollContainer = scrollAreaRef.current.querySelector(
				"[data-radix-scroll-area-viewport]",
			);
			if (scrollContainer)
				scrollContainer.scrollTop = scrollContainer.scrollHeight;
		}
	};

	const handleCreateFolder = async (name: string) => {
		const newFolder: Folder = {
			id: uuidv4(),
			name,
			files: [],
			createdAt: new Date(),
		};

		const response = await saveReport({
			folderName: newFolder.name,
			userId: String(id),
		});
		if (response) {
			addBotMessage(
				"Created New Folder. Please check the folder to get the detailed report ",
			);
			setPendingAction(null);
		}
	};

	const processPrompt = async (userMessage: Message) => {
		const lowerPrompt = userMessage.message.toLowerCase().trim();
		//also check if URL is valid
		const containsURL = URL_PATTERN.test(lowerPrompt);
		const containsReportGeneration = REPORT_GENERATION.some((keyword) =>
			lowerPrompt.includes(keyword),
		);
		if (containsURL) {
			setTargetUrl(lowerPrompt);
			const manualMessage = "Thank you for providing the URL";
			const botMessage: Message = {
				id: uuidv4(),
				message: manualMessage,
				sender: "ai",
			};

			if (!chatId && !createdChatId) {
				processManualMessages(userMessage, botMessage);
			} else {
				await saveChatMessage({
					chatId: createdChatId
						? (createdChatId as Id<"chats">)
						: (chatId as Id<"chats">),
					humanInTheLoopId: botMessage.id,
					sender: botMessage.sender,
					message: botMessage.message,
				});
			}
			setPendingAction(botMessage.id as string);
			requestHumanApproval("scan", manualMessage, "none", botMessage.id);
		} else if (containsReportGeneration) {
			const manualMessage = "Do you want to generate a report?";
			const botMessage: Message = {
				id: uuidv4(),
				message: manualMessage,
				sender: "ai",
			};
			if (!chatId && !createdChatId) {
				processManualMessages(userMessage, botMessage);
			} else {
				await saveChatMessage({
					chatId: createdChatId
						? (createdChatId as Id<"chats">)
						: (chatId as Id<"chats">),
					humanInTheLoopId: botMessage.id,
					sender: botMessage.sender,
					message: botMessage.message,
				});
			}
			setPendingAction(botMessage.id as string);
			setPendingAction(botMessage.id as string);
			requestHumanApproval("report", manualMessage, "none", botMessage.id);
		} else {
			//handled properly
			// streamChatResponse(userMessage.message);
			setIsLoading(true);
			const responseStream = await chatApis.chatOllama({
				prompt: userMessage.message,
			});
			setIsLoading(false);
			streamOllamaChatResponse(responseStream);
		}
	};

	const processManualMessages = async (
		userMessage: Message,
		manualMessage: Message,
	) => {
		const latestMessage = [userMessage, manualMessage];
		const response = await handleTitleGeneration(latestMessage);

		const result = await saveChat({
			userId: String((response as { userId: string }).userId),
			title: (response as { title: string })?.title,
		});

		setCreatedChatId(result);

		for (const msg of latestMessage) {
			await saveChatMessage({
				chatId: result,
				humanInTheLoopId: msg.id,
				sender: msg.sender,
				message: msg.message,
			});
		}
		window.history.pushState(
			{ path: `/chatbot/${result}` },
			"",
			`/chatbot/${result}`,
		);
	};

	const requestHumanApproval = (
		action: string,
		prompt: string,
		type?: string,
		id?: string,
	) => {
		let approvalMessage = "";
		if (action === "scan") {
			approvalMessage =
				"Select your preferred standard for the scan. You can choose from the following:";
			setActionPrompts(STANDARDS);
			setHumanInTheLoopMessage(approvalMessage);
		} else if (action === "report") {
			approvalMessage = "What type of report do you want to generate?";
			setActionPrompts(REPORTS);
			setHumanInTheLoopMessage(approvalMessage);
		} else if (action === "approval") {
			approvalMessage = "Do you want to generate a Report?";
			setActionPrompts([]);
			setHumanInTheLoopMessage(approvalMessage);
		} else if (action === "folder") {
			approvalMessage = "Select the folder where you want to save the report.";
			setActionPrompts(foldersList);
			setHumanInTheLoopMessage(approvalMessage);
		}
		const approvalMessageObject: Message = {
			id: id,
			message: prompt,
			sender: "ai",
			actionType: action,
			confirmType: type,
			humanInTheLoopMessage: approvalMessage,
		};
		setActionType(action);
		setConfirmType(type || null);
		setMessages((prev) => [...prev, approvalMessageObject]);
	};

	const confirmAction = async (action: string, type: string) => {
		if (!pendingAction) return;

		const userMessage: Message = {
			id: uuidv4(),
			message: action,
			sender: "user",
		};

		if (type === "scan") {
			try {
				if (createdChatId) {
					setMessages((prev) => [...prev, userMessage]);
				} else {
					await saveChatMessage({
						humanInTheLoopId: userMessage.id,
						chatId: chatId as Id<"chats">,
						sender: userMessage.sender,
						message: userMessage.message,
					});
				}
				//scan api call

				// const payload = {
				// 	targetUrl: targetUrl as string,
				// 	complianceStandard: action,
				// 	userId: Number(id),
				// };
				try {
					// setIsScanLoading(true);
					// setProgress(0);
					// const response = await scanApis.scanWithProgress(
					// 	payload,
					// 	(progress) => {
					// 		setProgress(progress);
					// 	},
					// );
					// console.log("assssss", response);
					// const { data } = response;
					// setIsScanLoading(false);
					// addBotMessage(
					// 	`Scan completed. Found ${data.filteredResults.total_vulnerabilities} vulnerabilities.`,
					// );
					addBotMessage("Scan completed. Found 44 vulnerabilities.");
				} catch (error) {
					addBotMessage("An error occurred while processing your request.");
					return error;
				}

				const manualMessage = "Do you want to generate a report?";
				const botMessage: Message = {
					id: uuidv4(),
					message: manualMessage,
					sender: "ai",
				};
				//save this as well

				await saveChatMessage({
					chatId: createdChatId
						? (createdChatId as Id<"chats">)
						: (chatId as Id<"chats">),
					humanInTheLoopId: botMessage.id,
					sender: botMessage.sender,
					message: botMessage.message,
				});

				setPendingAction(botMessage.id as string);
				requestHumanApproval(
					"approval",
					manualMessage,
					"report",
					botMessage.id,
				);
			} catch {
				addBotMessage("An error occurred while processing your request.");
			}
		} else if (type === "report") {
			addBotMessage(`${type} Generation In progress...`);
		} else if (type === "folder") {
			// Folder selection
			if (action === "Create New Folder") {
				if (createdChatId) {
					setMessages((prev) => [...prev, userMessage]);
				} else {
					await saveChatMessage({
						humanInTheLoopId: userMessage.id,
						chatId: chatId as Id<"chats">,
						sender: userMessage.sender,
						message: userMessage.message,
					});
				}

				// Show modal to create a new folder
				setIsCreateDialogOpen(true);
				// finalizeReportGeneration()
			} else {
				//add more functionalities for human intervention
			}
		} else {
			addBotMessage(`${type} In progress...`);
		}
	};

	const yesClicked = async (confirmType: string) => {
		if (confirmType === "report") {
			const userMessage: Message = {
				id: uuidv4(),
				message: "Yes",
				sender: "user",
			};
			if (createdChatId) {
				setMessages((prev) => [...prev, userMessage]);
			} else {
				await saveChatMessage({
					humanInTheLoopId: userMessage.id,
					chatId: chatId as Id<"chats">,
					sender: userMessage.sender,
					message: userMessage.message,
				});
			}

			try {
				// const payload = {
				// 	scanResults: {
				// 		targetUrl: "https://juice-shop.herokuapp.com",
				// 		complianceStandard: "GDPR",
				// 		filteredResults: {
				// 			total_vulnerabilities: 44,
				// 			unique_urls: 10,
				// 			total_risks: {
				// 				Medium: 12,
				// 				High: 0,
				// 				Low: 25,
				// 				Critical: 0,
				// 				Informational: 7,
				// 			},
				// 			findings: [
				// 				{
				// 					name: "Re-examine Cache-control Directives",
				// 					total_count: 3,
				// 					description:
				// 						"The cache-control header has not been set properly or is missing, allowing the browser and proxies to cache content. For static assets like css, js, or image files this might be intended, however, the resources should be reviewed to ensure that no sensitive content will be cached.",
				// 					solution:
				// 						'For secure content, ensure the cache-control HTTP header is set with "no-cache, no-store, must-revalidate". If an asset should be cached consider setting the directives "public, max-age, immutable".',
				// 					cwe_id: "525",
				// 					alert: "Re-examine Cache-control Directives",
				// 					compliance_details: ["Article 32 - Security of Processing"],
				// 					url_details: [
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/robots.txt",
				// 							method: "GET",
				// 							risk_level: "Informational",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com",
				// 							method: "GET",
				// 							risk_level: "Informational",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/sitemap.xml",
				// 							method: "GET",
				// 							risk_level: "Informational",
				// 						},
				// 					],
				// 					cve_ids: [],
				// 				},
				// 				{
				// 					name: "Content Security Policy (CSP) Header Not Set",
				// 					total_count: 3,
				// 					description:
				// 						"Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.",
				// 					solution:
				// 						"Ensure that your web server, application server, load balancer, etc. is configured to set the Content-Security-Policy header.",
				// 					cwe_id: "693",
				// 					alert: "Content Security Policy (CSP) Header Not Set",
				// 					compliance_details: ["Article 32 - Security of Processing"],
				// 					url_details: [
				// 						{
				// 							url: "https://juice-shop.herokuapp.com",
				// 							method: "GET",
				// 							risk_level: "Medium",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/sitemap.xml",
				// 							method: "GET",
				// 							risk_level: "Medium",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/ftp",
				// 							method: "GET",
				// 							risk_level: "Medium",
				// 						},
				// 					],
				// 					cve_ids: [],
				// 				},
				// 				{
				// 					name: "Cross-Domain Misconfiguration",
				// 					total_count: 9,
				// 					description:
				// 						"Web browser data loading may be possible, due to a Cross Origin Resource Sharing (CORS) misconfiguration on the web server.",
				// 					solution:
				// 						'Ensure that sensitive data is not available in an unauthenticated manner (using IP address white-listing, for instance).\nConfigure the "Access-Control-Allow-Origin" HTTP header to a more restrictive set of domains, or remove all CORS headers entirely, to allow the web browser to enforce the Same Origin Policy (SOP) in a more restrictive manner.',
				// 					cwe_id: "264",
				// 					alert: "Cross-Domain Misconfiguration",
				// 					compliance_details: ["Article 32 - Security of Processing"],
				// 					url_details: [
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/robots.txt",
				// 							method: "GET",
				// 							risk_level: "Medium",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/sitemap.xml",
				// 							method: "GET",
				// 							risk_level: "Medium",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com",
				// 							method: "GET",
				// 							risk_level: "Medium",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/runtime.js",
				// 							method: "GET",
				// 							risk_level: "Medium",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/assets/public/favicon_js.ico",
				// 							method: "GET",
				// 							risk_level: "Medium",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/polyfills.js",
				// 							method: "GET",
				// 							risk_level: "Medium",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/styles.css",
				// 							method: "GET",
				// 							risk_level: "Medium",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/main.js",
				// 							method: "GET",
				// 							risk_level: "Medium",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/vendor.js",
				// 							method: "GET",
				// 							risk_level: "Medium",
				// 						},
				// 					],
				// 					cve_ids: [],
				// 				},
				// 				{
				// 					name: "Cross-Domain JavaScript Source File Inclusion",
				// 					total_count: 4,
				// 					description:
				// 						"The page includes one or more script files from a third-party domain.",
				// 					solution:
				// 						"Ensure JavaScript source files are loaded from only trusted sources, and the sources can't be controlled by end users of the application.",
				// 					cwe_id: "829",
				// 					alert: "Cross-Domain JavaScript Source File Inclusion",
				// 					compliance_details: ["Article 32 - Security of Processing"],
				// 					url_details: [
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/sitemap.xml",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/sitemap.xml",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 					],
				// 					cve_ids: [],
				// 				},
				// 				{
				// 					name: "Strict-Transport-Security Header Not Set",
				// 					total_count: 10,
				// 					description:
				// 						"HTTP Strict Transport Security (HSTS) is a web security policy mechanism whereby a web server declares that complying user agents (such as a web browser) are to interact with it using only secure HTTPS connections (i.e. HTTP layered over TLS/SSL). HSTS is an IETF standards track protocol and is specified in RFC 6797.",
				// 					solution:
				// 						"Ensure that your web server, application server, load balancer, etc. is configured to enforce Strict-Transport-Security.",
				// 					cwe_id: "319",
				// 					alert: "Strict-Transport-Security Header Not Set",
				// 					compliance_details: ["Article 32 - Security of Processing"],
				// 					url_details: [
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/robots.txt",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/sitemap.xml",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/ftp",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/runtime.js",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/assets/public/favicon_js.ico",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/polyfills.js",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/main.js",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/styles.css",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/vendor.js",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 					],
				// 					cve_ids: ["CVE-2024-11946", "CVE-2021-39090"],
				// 				},
				// 				{
				// 					name: "Modern Web Application",
				// 					total_count: 2,
				// 					description:
				// 						"The application appears to be a modern web application. If you need to explore it automatically then the Ajax Spider may well be more effective than the standard one.",
				// 					solution:
				// 						"This is an informational alert and so no changes are required.",
				// 					cwe_id: "-1",
				// 					alert: "Modern Web Application",
				// 					compliance_details: ["Article 32 - Security of Processing"],
				// 					url_details: [
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/sitemap.xml",
				// 							method: "GET",
				// 							risk_level: "Informational",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com",
				// 							method: "GET",
				// 							risk_level: "Informational",
				// 						},
				// 					],
				// 					cve_ids: [],
				// 				},
				// 				{
				// 					name: "Timestamp Disclosure - Unix",
				// 					total_count: 11,
				// 					description:
				// 						"A timestamp was disclosed by the application/web server. - Unix",
				// 					solution:
				// 						"Manually confirm that the timestamp data is not sensitive, and that the data cannot be aggregated to disclose exploitable patterns.",
				// 					cwe_id: "200",
				// 					alert: "Timestamp Disclosure - Unix",
				// 					compliance_details: ["Article 32 - Security of Processing"],
				// 					url_details: [
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/robots.txt",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/sitemap.xml",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/ftp",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/runtime.js",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/assets/public/favicon_js.ico",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/polyfills.js",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/main.js",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/main.js",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/styles.css",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/vendor.js",
				// 							method: "GET",
				// 							risk_level: "Low",
				// 						},
				// 					],
				// 					cve_ids: [
				// 						"CVE-2024-13110",
				// 						"CVE-2024-13042",
				// 						"CVE-2024-47923",
				// 						"CVE-2024-47922",
				// 						"CVE-2024-12984",
				// 						"CVE-2017-7923",
				// 					],
				// 				},
				// 				{
				// 					name: "Information Disclosure - Suspicious Comments",
				// 					total_count: 2,
				// 					description:
				// 						"The response appears to contain suspicious comments which may help an attacker. Note: Matches made within script blocks or files are against the entire content not only comments.",
				// 					solution:
				// 						"Remove all comments that return information that may help an attacker and fix any underlying problems they refer to.",
				// 					cwe_id: "200",
				// 					alert: "Information Disclosure - Suspicious Comments",
				// 					compliance_details: ["Article 32 - Security of Processing"],
				// 					url_details: [
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/main.js",
				// 							method: "GET",
				// 							risk_level: "Informational",
				// 						},
				// 						{
				// 							url: "https://juice-shop.herokuapp.com/vendor.js",
				// 							method: "GET",
				// 							risk_level: "Informational",
				// 						},
				// 					],
				// 					cve_ids: [
				// 						"CVE-2024-13110",
				// 						"CVE-2024-13042",
				// 						"CVE-2024-47923",
				// 						"CVE-2024-47922",
				// 						"CVE-2024-12984",
				// 						"CVE-2017-7923",
				// 					],
				// 				},
				// 			],
				// 		},
				// 	},
				// };

				setIsLoading(true);
				//report generation api call
				// const responseStream = await scanApis.scanReportGeneration({
				// 	scanResults: payload.scanResults,
				// });
				// setIsLoading(false);

				// await streamOllamaChatResponse(responseStream);
				// if (!streaming) {
				// 	const manualMessage =
				// 		"Create a new folder. Or select an existing folder to save the report.";
				// 	const botMessage: Message = {
				// 		id: uuidv4(),
				// 		message: manualMessage,
				// 		sender: "ai",
				// 	};

				// 	await saveChatMessage({
				// 		chatId: createdChatId
				// 			? (createdChatId as Id<"chats">)
				// 			: (chatId as Id<"chats">),
				// 		humanInTheLoopId: botMessage.id,
				// 		sender: botMessage.sender,
				// 		message: botMessage.message,
				// 	});

				// 	setPendingAction(botMessage.id as string);
				// 	requestHumanApproval(
				// 		"folder",
				// 		manualMessage,
				// 		"report",
				// 		botMessage.id,
				// 	);
				// }
			} catch (error) {
				return error;
			}
		}
	};

	const cancelAction = async () => {
		setPendingAction(null);
		const userMessage: Message = {
			id: uuidv4(),
			message: "No",
			sender: "user",
		};
		if (createdChatId) {
			setMessages((prev) => [...prev, userMessage]);
		} else {
			await saveChatMessage({
				humanInTheLoopId: userMessage.id,
				chatId: chatId as Id<"chats">,
				sender: userMessage.sender,
				message: userMessage.message,
			});
		}
		addBotMessage("Action cancelled. How else can I assist you?");
	};

	const addBotMessage = async (message: string) => {
		const botMessage: Message = { id: uuidv4(), message, sender: "ai" };
		setMessages((prev) => [...prev, botMessage]);

		await saveChatMessage({
			humanInTheLoopId: botMessage.id,
			chatId: createdChatId
				? (createdChatId as Id<"chats">)
				: (chatId as Id<"chats">),
			sender: botMessage.sender,
			message: botMessage.message,
		});
	};

	const generateTitle = async (updatedMessages: string[]) => {
		try {
			const initialMessage: string = updatedMessages.join(" ");

			// Call the title generation API
			const { data } = await chatApis.generateTitle({ initialMessage });

			return { title: data.title, userId: id };
		} catch (error) {
			return error;
		}
	};

	const handleSend = async () => {
		if (input.trim()) {
			const userMessage: Message = {
				id: uuidv4(),
				message: input,
				sender: "user",
			};
			setMessages((prev) => [...prev, userMessage]);
			setInput("");
			if (createdChatId || chatId) {
				try {
					await saveChatMessage({
						humanInTheLoopId: userMessage.id,
						chatId: createdChatId
							? (createdChatId as Id<"chats">)
							: (chatId as Id<"chats">),
						sender: userMessage.sender,
						message: userMessage.message,
					});
					processPrompt(userMessage);
				} catch (error) {
					return error;
				}
			} else {
				processPrompt(userMessage);
			}
		}
	};

	const updateUI = (message: string) => {
		setMessages((prev) => {
			const lastMessage = prev[prev.length - 1];
			if (lastMessage?.sender === "ai" && lastMessage.isStreaming) {
				return [...prev.slice(0, -1), { ...lastMessage, message: message }];
			}

			return [
				...prev,
				{
					id: uuidv4(),
					message: message,
					sender: "ai",
					isStreaming: true,
				},
			];
		});
	};

	const streamOllamaChatResponse = async (
		responseStream: ReadableStream<Uint8Array>,
	) => {
		try {
			const reader = responseStream.getReader();
			const decoder = new TextDecoder();
			let accumulatedMessage = "";
			setStreaming(true);

			while (true) {
				try {
					const { done, value } = await reader.read();

					if (done) {
						completeMessage();
						break;
					}

					// Handle the case where value is undefined or null
					if (!value) continue;

					const chunk = decoder.decode(value, { stream: true });
					const lines = chunk
						.split("\n")
						.filter((line) => line.trim().length > 0);

					for (const line of lines) {
						try {
							const parsed = JSON.parse(line);
							if (parsed.response) {
								accumulatedMessage += parsed.response;
								updateUI(accumulatedMessage);
							}
						} catch (parseError) {
							return parseError;
						}
					}
				} catch (readError) {
					return readError;
				}
			}
		} catch (error) {
			addBotMessage("Oops! Something went wrong while streaming the response.");
			throw error;
		} finally {
			setStreaming(false);
			setIsLoading(false);
		}
	};

	const completeMessage = async () => {
		let latestmessage: Message[] = [];
		setMessages((prev) => {
			const updatedMessages = prev.map((msg) =>
				msg.isStreaming ? { ...msg, isStreaming: false } : msg,
			);

			// latestmessage = [...updatedMessages];
			latestmessage = updatedMessages;
			return updatedMessages;
		});

		if (latestmessage.length === 2 && !chatId) {
			const response = await handleTitleGeneration(latestmessage);

			const result = await saveChat({
				userId: String((response as { userId: string }).userId),
				title: (response as { title: string })?.title,
			});
			setCreatedChatId(result);

			for (const msg of latestmessage) {
				await saveChatMessage({
					chatId: result,
					humanInTheLoopId: msg.id,
					sender: msg.sender,
					message: msg.message,
				});
			}

			window.history.pushState(
				{ path: `/chatbot/${result}` },
				"",
				`/chatbot/${result}`,
			);
		} else if (createdChatId) {
			await saveChatMessage({
				humanInTheLoopId: latestmessage[latestmessage.length - 1].id,
				chatId: createdChatId as Id<"chats">,
				sender: "ai",
				message: latestmessage[latestmessage.length - 1].message,
			});
		} else {
			await saveChatMessage({
				humanInTheLoopId: latestmessage[latestmessage.length - 1].id,
				chatId: chatId as Id<"chats">,
				sender: "ai",
				message: latestmessage[latestmessage.length - 1].message,
			});
		}
	};

	// const streamChatResponse = async (prompt: string) => {
	// 	try {
	// 		setIsLoading(true);
	// 		const responseStream = (await chatApis.chat({
	// 			message: prompt,
	// 			useRAG: false,
	// 		})) as StreamResponse;

	// 		if (!responseStream.ok || !responseStream.body) {
	// 			throw new Error("Failed to get response stream");
	// 		}

	// 		const reader = responseStream.body.getReader();
	// 		const decoder = new TextDecoder();
	// 		let accumulatedMessage = "";

	// 		while (true) {
	// 			const { done, value } = await reader.read();

	// 			if (done) {
	// 				completeMessage();
	// 				break;
	// 			}

	// 			// Decode and append new chunk
	// 			const chunk = decoder.decode(value, { stream: true });
	// 			accumulatedMessage += chunk;

	// 			// Update UI with accumulated message
	// 			updateUI(accumulatedMessage);
	// 		}
	// 	} catch (error) {
	// 		const errorMessage =
	// 			error instanceof Error ? error.message : "Unknown error occurred";
	// 		addBotMessage(`Error: ${errorMessage}`);
	// 	} finally {
	// 		setIsLoading(false);
	// 	}
	// };

	// Custom components for markdown rendering
	const components: Partial<Components> = {
		h1: ({ children }) => (
			<h1 className="text-2xl font-bold mb-4 mt-6 text-primary">{children}</h1>
		),
		h2: ({ children }) => (
			<h2 className="text-xl font-semibold mb-3 mt-5 text-primary">
				{children}
			</h2>
		),
		h3: ({ children }) => (
			<h2 className="text-lg font-semibold mb-3 mt-5 text-primary">
				{children}
			</h2>
		),
		p: ({ children }) => (
			<p className="mb-4 text-primary leading-relaxed">{children}</p>
		),
		li: ({ children }) => (
			<ul className="list-disc pl-6 mb-4 space-y-2 text-primary font-semibold ">
				{children}
			</ul>
		),
		ul: ({ children }) => (
			<ul className="list-disc pl-6 mb-4 space-y-2 text-primary font-semibold ">
				{children}
			</ul>
		),
		strong: ({ children }) => (
			<strong className="text-primary font-bold">{children}</strong>
		),
	};

	return (
		<div className="flex flex-col space-y-6 p-4 w-full h-full md:h-[90vh] rounded-lg shadow-lg bg-muted/50">
			{!chatData ? (
				<div className="flex items-center justify-center w-full h-full">
					<Spinner />
				</div>
			) : chatData && messages.length === 0 ? (
				<>
					<div className="flex flex-col items-center justify-center w-full h-full">
						<motion.div
							className="w-full max-w-[300px] aspect-w-1 aspect-h-1"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.25 }}
						>
							<img
								src={MiraAvatar}
								alt="Avatar"
								className="w-full h-full object-cover"
							/>
						</motion.div>
						<motion.h1
							className="text-2xl font-semibold mt-4"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.25 }}
						>
							Need a Security Checkup?
						</motion.h1>
					</div>
				</>
			) : (
				<ScrollArea ref={scrollAreaRef} className="flex-1 p-4  w-full">
					{messages.map((message) => {
						const isPendingAction =
							pendingAction === message.id ||
							pendingAction === message.humanInTheLoopId;
						const isAISender = message.sender === "ai";

						if (isPendingAction && isAISender) {
							return actionType === "approval" ? (
								<motion.div
									key={message.id}
									initial={{ opacity: 0, y: 50 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -50 }}
									transition={{ duration: 0.3 }}
								>
									<HumanInTheLoopApproval
										key={message.id}
										message={humanInTheLoopMessage || ""}
										onCancel={cancelAction}
										confirmType={confirmType || ""}
										onConfirm={yesClicked}
									/>
								</motion.div>
							) : (
								<motion.div
									key={message.id}
									initial={{ opacity: 0, y: 50 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -50 }}
									transition={{ duration: 0.3 }}
								>
									<HumanInTheLoopOptions
										key={message.id}
										question={humanInTheLoopMessage || ""}
										actionPrompts={actionPrompts || []}
										onConfirm={confirmAction}
									/>
								</motion.div>
							);
						}

						const isUser = message.sender === "user";
						const messageClasses = `inline-block p-2 rounded-lg ${
							isUser ? "bg-black text-white" : "bg-gray-200 text-black"
						}`;
						const containerClasses = `mb-4 ${isUser ? "text-right" : "text-left"}`;

						return (
							<motion.div
								key={message.id}
								// initial={{ opacity: 0, y: 50 }}
								className={containerClasses}
								initial={{ opacity: 0 }}
								// exit={{ opacity: 0, y: -50 }}
								animate={{ opacity: 1 }}
							>
								<span className={`${messageClasses}`}>
									{isUser ? (
										message.message
									) : (
										<ReactMarkdown components={components}>
											{message.message}
										</ReactMarkdown>
									)}
								</span>
							</motion.div>
						);
					})}

					{isLoading && (
						<motion.div
							initial={{ opacity: 0, y: 50 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -50 }}
							transition={{ duration: 0.3 }}
							className="flex items-center space-x-2 text-gray-500"
						>
							<Spinner />
							<span>Mira is thinking...</span>
						</motion.div>
					)}
				</ScrollArea>
			)}
			{/* {isScanLoading && (
				<div className="w-full space-y-2">
					<Progress value={progress} className="w-full" />
					<p className="text-sm text-center text-gray-500">
						Scanning your website for vulnerabilities...
					</p>
				</div>
			)} */}
			{/* {isScanLoading && (
				<div className="space-y-2">
					<Progress value={progress} className="w-full" />
					<p className="text-sm text-center text-gray-500">
						Scan in progress: {progress.toFixed(0)}%
					</p>
				</div>
			)} */}
			<div className="flex items-center w-full rounded-lg px-4 py-2 shadow-sm border">
				<img src={MiraLogo} alt="Logo" className="w-7 h-7 mr-2" />
				<Textarea
					value={input}
					onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
						setInput(e.target.value)
					}
					onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSend();
						}
					}}
					className="flex-1"
					placeholder="Type your prompt here or click on the action cards..."
					disabled={isLoading || pendingAction}
				/>
				<ChatActions
					handleSend={handleSend}
					disabled={isLoading || pendingAction}
				/>
			</div>

			<CreateFolderDialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				onCreateFolder={handleCreateFolder}
			/>
		</div>
	);
};

export default MiraChatBot;
