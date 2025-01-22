import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

//components
import { ScrollArea } from "@components/ui/scroll-area";
import { Spinner } from "@components/loader/spinner";
import { Progress } from "@components/ui/progress";
import { HumanInTheLoopOptions } from "./human-in-the-loop-options";
import { HumanInTheLoopApproval } from "./human-in-the-loop-approval";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";

//apis
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { chatApis } from "../../api/chat";
import type { Id } from "../../convex/_generated/dataModel";

//store
import useStore from "../../store/store";
import useChatActionStore from "../../store/chatActions";

// svgs
import mira_logo from "../../assets/mira_logo.png"; // Add this line to import mira_logo
import MiraAvatar from "../../assets/Mira.svg";
import { MoreHorizontal, SendIcon } from "lucide-react";

// types
import type {
	Message,
	ChatHistory,
	Info,
	RequestHumanInLoop,
} from "../../types/chats";
import type { Folder, FolderItem, FolderType } from "../../types/reports";

//constants
import { scanApis } from "../../api/scan";
import useScanStore from "../../store/scanStore";
import MarkdownViewer from "../file/MarkdownViewer";
import {
	URL_PATTERN,
	STANDARDS,
	REPORTS,
	NEGATION_PATTERNS,
	CLARIFICATION_PATTERNS,
	SCANTYPES,
	CREATE_FOLDER_ACTION,
} from "./constants";
import { isReportRequest } from "./helpers";
import { actionCards, moreCards } from "./actions";
import { CreateFolderDialog } from "../folder/CreateFolderDialog";
import { HumanInTheLoopInput } from "./human-in-the-loop-input";
import { funkyGreeting } from "./greetings";
import { showErrorToast } from "../toaster";

const MiraChatBot: React.FC = () => {
	const navigate = useNavigate();
	const [showMore, setShowMore] = useState(false);
	const [scanType, setScanType] = useState<string | null>(null);
	const [confirmType, setConfirmType] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [streaming, setStreaming] = useState(false);
	const [chatsLoader, setChatsLoader] = useState(false);
	const [info, setInfo] = useState<Info[]>([]);
	const [isScanLoading, setIsScanLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [input, setInput] = useState("");
	const [progressLoaderMessage, setProgressLoaderMessage] = useState("");
	const [folderId, setFolderId] = useState("");
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [foldersList, setFoldersList] = useState(CREATE_FOLDER_ACTION);
	const [requestHumanInLoop, setRequestHumanInLoop] =
		useState<RequestHumanInLoop | null>();

	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const { chatId: chatIdParam } = useParams<{ chatId: string }>();
	const chatId = chatIdParam;

	const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	// Get the funky greeting based on the detected time zone
	const greeting = funkyGreeting(timeZone);

	//store actions

	const { user } = useStore();
	const { scanResponse, setScanResponse } = useScanStore();
	const {
		targetUrl,
		fetchChatsRegurlarly,
		messages,
		createdChatId,
		pendingAction,
		actionPrompts,
		actionType,
		humanInTheLoopMessage,
		setTargetUrl,
		setFetchChatsRegurlarly,
		setMessages,
		setCreatedChatId,
		setPendingAction,
		setActionPrompts,
		setActionType,
		setHumanInTheLoopMessage,
		chatSummaryContent,
		setChatSummaryContent,
	} = useChatActionStore();

	const saveChatMessage = useMutation(api.chats.saveChatMessage);
	const saveChat = useMutation(api.chats.saveChat);
	const saveFile = useMutation(api.reports.addReport);
	const saveSummary = useMutation(api.summaries.saveSummary);
	const isValidChatId = useQuery(api.chats.validateChatId, {
		chatId: chatIdParam ? chatIdParam : "",
		userId: String(user?.id),
	});
	const folderData = useQuery(
		api.reports.getReportFoldersByUser,
		user?.id && {
			userId: String(user?.id),
		},
	);
	const chatData = useQuery(
		api.chats.getChatHistory,
		fetchChatsRegurlarly && isValidChatId ? { chatId: chatId } : "skip",
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: all dependencies not needed
	useEffect(() => {
		if (chatIdParam) {
			setChatsLoader(true);
			setFetchChatsRegurlarly(true);
			setCreatedChatId(chatIdParam);
			if (isValidChatId !== undefined) {
				setFetchChatsRegurlarly(false);
				if (isValidChatId) {
					setFetchChatsRegurlarly(true);
				} else {
					setMessages([]);
					setFetchChatsRegurlarly(false);
					navigate("/chatbot");
					setChatsLoader(false);
				}
			}
		} else {
			setMessages([]);
		}
	}, [chatIdParam, isValidChatId]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: all dependencies not needed
	useEffect(() => {
		handleScrollToBottom();
	}, [messages]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: all dependencies not needed
	useEffect(() => {
		// setMessages(null);
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

			setChatsLoader(false);
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

	const handleTitleGeneration = async (messages: string) => {
		try {
			const response = await generateTitle(messages);

			return response;
		} catch (error) {
			return error;
		}
	};

	const handleScrollToBottom = useCallback(() => {
		requestAnimationFrame(() => {
			if (scrollAreaRef.current) {
				const scrollContainer = scrollAreaRef.current.querySelector(
					"[data-radix-scroll-area-viewport]",
				);
				if (scrollContainer) {
					scrollContainer.scrollTop = scrollContainer.scrollHeight;
				}
			}
		});
	}, []);
	const saveReport = useMutation(api.reports.createReportFolder);

	const handleCreateFolder = async (
		name: string,
		action: RequestHumanInLoop,
	) => {
		if (
			foldersList.some(
				(folder) => folder.name.toLowerCase() === name.toLowerCase(),
			)
		) {
			showErrorToast("A folder with this name already exists.");
			return;
		}

		const newFolder: Folder = {
			id: uuidv4(),
			name,
			files: [],
			createdAt: new Date(),
		};

		const response = await saveReport({
			folderName: newFolder.name,
			userId: String(user?.id),
		});
		if (response) {
			setPendingAction(null);
			addBotMessage(`Created folder ${newFolder.name} `);
			const manualMessage = "Thank you for providing the file name";
			const botMessage: Message = {
				id: uuidv4(),
				message: manualMessage,
				sender: "ai",
			};
			setFolderId(response);
			await saveChatMessage({
				chatId: createdChatId
					? (createdChatId as Id<"chats">)
					: (chatId as Id<"chats">),
				humanInTheLoopId: botMessage.id,
				sender: botMessage.sender,
				message: botMessage.message,
			});
			setPendingAction(botMessage.id as string);
			setRequestHumanInLoop({
				action: action.action,
				prompt: manualMessage,
				type: action.type,
				id: botMessage.id,
			});
			requestHumanApproval(
				action.action,
				manualMessage,
				action.type,
				botMessage.id,
			);
		}
	};

	const processPrompt = async (userMessage: Message, useRag?: boolean) => {
		const lowerPrompt = userMessage.message.toLowerCase().trim();
		const extractURLs = (text: string): string[] => {
			return text.match(URL_PATTERN) || [];
		};
		const hasURL = URL_PATTERN.test(lowerPrompt);
		const hasNegation = NEGATION_PATTERNS.some((pattern) =>
			pattern.test(lowerPrompt),
		);
		const isClarification = CLARIFICATION_PATTERNS.test(lowerPrompt);
		const reportRequest = isReportRequest(lowerPrompt);

		if (hasNegation) {
			setIsLoading(true);
			const responseStream = (await chatApis.chat({
				message: userMessage.message,
				useRAG: false,
			})) as StreamResponse;

			setIsLoading(false);
			streamChatResponse(userMessage, responseStream as StreamResponse);
		} else if (isClarification) {
			//handled properly
			const responseStream = (await chatApis.chat({
				message: userMessage.message,
				useRAG: false,
			})) as StreamResponse;
			setIsLoading(false);
			streamChatResponse(userMessage, responseStream);
		} else if (hasURL) {
			const urls = extractURLs(userMessage.message);
			setTargetUrl(urls[0]);
			const manualMessage =
				"Thank you for providing the URL. Please select type of scan you want to perform.";
			const botMessage: Message = {
				id: uuidv4(),
				message: manualMessage,
				sender: "ai",
			};

			if (!chatId && !createdChatId) {
				processManualMessages(userMessage, botMessage);
			} else {
				await saveChatMessage({
					chatId: chatId
						? (chatId as Id<"chats">)
						: (createdChatId as Id<"chats">),
					humanInTheLoopId: botMessage.id,
					sender: botMessage.sender,
					message: botMessage.message,
				});
			}
			setPendingAction(botMessage.id as string);
			setRequestHumanInLoop({
				action: "scan",
				prompt: manualMessage,
				type: "none",
				id: botMessage.id,
			});
			requestHumanApproval("scan", manualMessage, "none", botMessage.id);
		} else if (reportRequest) {
			const manualMessage = "Thank you for your request.";
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
			setRequestHumanInLoop({
				action: "report",
				prompt: manualMessage,
				type: "none",
				id: botMessage.id,
			});
			requestHumanApproval("report", manualMessage, "none", botMessage.id);
		} else {
			try {
				setIsLoading(true);
				const responseStream = (await chatApis.chat({
					message: userMessage.message,
					useRAG: useRag,
				})) as StreamResponse;
				setIsLoading(false);
				streamChatResponse(userMessage, responseStream as StreamResponse);
			} catch (error) {
				return error;
			}
		}
	};

	const processManualMessages = async (
		userMessage: Message,
		botMessage: Message,
	) => {
		const latestMessage = [userMessage, botMessage];
		const response = await handleTitleGeneration(botMessage.message);

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
		action: string, // action for the approval message
		prompt: string, // prompt to show to the human
		type?: string, // type of action to perform [none for options] [action type for approval]
		id?: string, // id to link the approval message to the action
	) => {
		let approvalMessage = "";
		if (action === "scan") {
			approvalMessage =
				"Select your preferred scan type. You can choose from the following:";
			setActionPrompts(SCANTYPES);
			setInfo(SCANTYPES);
			setHumanInTheLoopMessage(approvalMessage);
		} else if (action === "standards") {
			approvalMessage =
				"Select your preferred standard for the scan. You can choose from the following:";
			setActionPrompts(STANDARDS);
			setInfo(STANDARDS);
			setHumanInTheLoopMessage(approvalMessage);
		} else if (action === "report") {
			approvalMessage = "What type of report do you want to generate?";
			setActionPrompts(REPORTS);
			setInfo(REPORTS);
			setHumanInTheLoopMessage(approvalMessage);
		} else if (action === "approval") {
			approvalMessage = prompt;
			setActionPrompts([]);
			setHumanInTheLoopMessage(approvalMessage);
		} else if (action === "folder") {
			approvalMessage =
				"Select or create a folder where you want to save the scan report.";
			const folders = foldersList.map((folder) => {
				if (folder.type === "folder") {
					return { ...folder, type: "scan-summary" }; // Change type to "chat-summary"
				}
				return folder; // Return the folder unchanged if type is not "folder"
			});
			setActionPrompts(folders);
			setHumanInTheLoopMessage(approvalMessage);
		} else if (action === "save-chat-summary") {
			approvalMessage =
				"Select or create a folder where you want to save the chat summary report.";
			const folders = foldersList.map((folder) => {
				if (folder.type === "folder") {
					return { ...folder, type: "chat-summary" }; // Change type to "chat-summary"
				}
				return folder; // Return the folder unchanged if type is not "folder"
			});
			setActionPrompts(folders);
			setHumanInTheLoopMessage(approvalMessage);
		} else if (action === "input") {
			approvalMessage = "Please enter the file name for the report";
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

	const [showInfo, setShowInfo] = useState(false);

	const confirmAction = async (
		action: string,
		type: string,
		actionId?: string,
	) => {
		if (!pendingAction) return;

		const userMessage: Message = {
			id: uuidv4(),
			message: action,
			sender: "user",
		};

		if (type === "scan") {
			setScanType(action);
			try {
				setMessages((prev) => [...prev, userMessage]);
				await saveChatMessage({
					humanInTheLoopId: userMessage.id,
					chatId: chatId
						? (chatId as Id<"chats">)
						: (createdChatId as Id<"chats">),
					sender: userMessage.sender,
					message: userMessage.message,
				});
				//message to pop after HIT
				const manualMessage =
					"Thank you for providing the scan type. Please select the standard you want to scan against.";
				const botMessage: Message = {
					id: uuidv4(),
					message: manualMessage,
					sender: "ai",
				};
				setPendingAction(botMessage.id as string);
				await saveChatMessage({
					humanInTheLoopId: botMessage.id,
					chatId: createdChatId
						? (createdChatId as Id<"chats">)
						: (chatId as Id<"chats">),
					sender: botMessage.sender,
					message: botMessage.message,
				});

				setRequestHumanInLoop({
					action: "standards",
					prompt: manualMessage,
					type: "none",
					id: botMessage.id,
				});
				requestHumanApproval("standards", manualMessage, "none", botMessage.id);
			} catch {
				addBotMessage("An error occurred while processing your request.");
			}
		} else if (type === "standards") {
			try {
				setMessages((prev) => [...prev, userMessage]);
				await saveChatMessage({
					humanInTheLoopId: userMessage.id,
					chatId: chatId
						? (chatId as Id<"chats">)
						: (createdChatId as Id<"chats">),
					sender: userMessage.sender,
					message: userMessage.message,
				});
				//scan api call
				try {
					const payload = {
						url: targetUrl as string,
						complianceStandard: action as string,
						scanType: scanType as string,
						userId: Number(user?.id),
					};
					setPendingAction(null);
					setIsScanLoading(true);
					setProgress(0);
					setProgressLoaderMessage("Scanning in progress...");

					const totalSteps = 20;
					const stepDelay = 500;

					// Create the progress animation promise
					const progressAnimation = (async () => {
						for (let i = 0; i < totalSteps; i++) {
							await new Promise((resolve) => setTimeout(resolve, stepDelay));
							setProgress(
								(prevProgress) => Math.min(prevProgress + 100 / totalSteps, 95), // Stop at 95% until API completes
							);
						}
					})();

					// Run both the animation and API call
					const [response] = await Promise.all([
						scanApis.scanWithProgress(payload),
						progressAnimation,
					]);

					setProgress(100);
					setScanResponse(response.data);
					addBotMessage(
						`Scan completed using **${response.data.complianceStandardUrl}**. Found **${response.data.totals.totalIssues}** vulnerabilities.`,
					);
				} catch (error) {
					addBotMessage("An error occurred while processing your request.");
					return error;
				} finally {
					setIsScanLoading(false);
				}

				const manualMessage = "Do you want to generate a brief summary?";
				const botMessage: Message = {
					id: uuidv4(),
					message: manualMessage,
					sender: "ai",
				};

				await saveChatMessage({
					chatId: createdChatId
						? (createdChatId as Id<"chats">)
						: (chatId as Id<"chats">),
					humanInTheLoopId: botMessage.id,
					sender: botMessage.sender,
					message: botMessage.message,
				});

				setPendingAction(botMessage.id as string);
				setRequestHumanInLoop({
					action: "approval",
					prompt: manualMessage,
					type: "report",
					id: botMessage.id,
				});
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
			if (action === "Chat Summary Report") {
				if (createdChatId) {
					setMessages((prev) => [...prev, userMessage]);
					await saveChatMessage({
						humanInTheLoopId: userMessage.id,
						chatId: createdChatId as Id<"chats">,
						sender: userMessage.sender,
						message: userMessage.message,
					});
				} else {
					await saveChatMessage({
						humanInTheLoopId: userMessage.id,
						chatId: chatId as Id<"chats">,
						sender: userMessage.sender,
						message: userMessage.message,
					});
				}
				setPendingAction(null);
				const payload = {
					messages: messages.map((msg) => msg.message),
				};
				const responseStream = (await chatApis.chatSummaryOpenAI(
					payload,
				)) as StreamResponse;

				await streamChatResponse(
					userMessage,
					responseStream as StreamResponse,
					action as string,
				);
				const manualMessage =
					"Do you want to save this as a detailed Chat Summary report?";
				const botMessage: Message = {
					id: uuidv4(),
					message: manualMessage,
					sender: "ai",
				};

				await saveChatMessage({
					chatId: createdChatId
						? (createdChatId as Id<"chats">)
						: (chatId as Id<"chats">),
					humanInTheLoopId: botMessage.id,
					sender: botMessage.sender,
					message: botMessage.message,
				});

				setPendingAction(botMessage.id as string);
				setRequestHumanInLoop({
					action: "approval",
					prompt: manualMessage,
					type: "save-chat-summary",
					id: botMessage.id,
				});

				requestHumanApproval(
					"approval",
					manualMessage,
					"save-chat-summary",
					botMessage.id,
				);
			} else if (action === "Vulnerability Report") {
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
				setPendingAction(null);
				const manualMessage = "Thank you for your response";
				const botMessage: Message = {
					id: uuidv4(),
					message: manualMessage,
					sender: "ai",
				};

				setPendingAction(botMessage.id as string);

				await saveChatMessage({
					chatId: createdChatId
						? (createdChatId as Id<"chats">)
						: (chatId as Id<"chats">),
					humanInTheLoopId: botMessage.id,
					sender: botMessage.sender,
					message: botMessage.message,
				});
				if (!targetUrl) {
					addBotMessage("Please provide a URL to scan");
					setPendingAction(null);
					return;
				}

				setRequestHumanInLoop({
					action: "standards",
					prompt: manualMessage,
					type: "none",
					id: botMessage.id,
				});
				requestHumanApproval("standards", manualMessage, "none", botMessage.id);
			}
		} else if (type === "scan-summary") {
			// Folder selection

			if (action === "Create New Folder") {
				setIsCreateDialogOpen(true);
				setRequestHumanInLoop({
					action: "input",
					type: "create-file",
				});
			} else {
				setFolderId(actionId as string);
				const manualMessage = "Thank you for providing the file name";
				const botMessage: Message = {
					id: uuidv4(),
					message: manualMessage,
					sender: "ai",
				};

				await saveChatMessage({
					chatId: createdChatId
						? (createdChatId as Id<"chats">)
						: (chatId as Id<"chats">),
					humanInTheLoopId: botMessage.id,
					sender: botMessage.sender,
					message: botMessage.message,
				});

				setPendingAction(botMessage.id as string);
				setRequestHumanInLoop({
					action: "input",
					prompt: manualMessage,
					type: "create-file",
					id: botMessage.id,
				});
				requestHumanApproval(
					"input",
					manualMessage,
					"create-file",
					botMessage.id,
				);
			}
		} else if (type === "chat-summary") {
			if (action === "Create New Folder") {
				setRequestHumanInLoop({
					action: "input",
					type: "chat-summary-create-file",
				});
				setIsCreateDialogOpen(true);
			} else {
				setFolderId(actionId as string);
				const manualMessage = "Thank you for providing the file name";
				const botMessage: Message = {
					id: uuidv4(),
					message: manualMessage,
					sender: "ai",
				};
				await saveChatMessage({
					chatId: createdChatId
						? (createdChatId as Id<"chats">)
						: (chatId as Id<"chats">),
					humanInTheLoopId: botMessage.id,
					sender: botMessage.sender,
					message: botMessage.message,
				});
				setPendingAction(botMessage.id as string);
				setRequestHumanInLoop({
					action: "input",
					prompt: manualMessage,
					type: "chat-summary-create-file",
					id: botMessage.id,
				});
				requestHumanApproval(
					"input",
					manualMessage,
					"chat-summary-create-file",
					botMessage.id,
				);
			}
		} else if (type === "create-file" && action) {
			let markDownContent = "";
			try {
				setPendingAction(null);
				setIsScanLoading(true);
				setProgress(0);
				setProgressLoaderMessage("Generating report");

				const totalSteps = 10;
				const stepDelay = 500;

				// Create the progress animation promise
				const progressAnimation = (async () => {
					for (let i = 0; i < totalSteps; i++) {
						await new Promise((resolve) => setTimeout(resolve, stepDelay));
						setProgress(
							(prevProgress) => Math.min(prevProgress + 100 / totalSteps, 95), // Stop at 95% until API completes
						);
					}
				})();

				// Run both the animation and API call
				const [response] = await Promise.all([
					scanApis.detailedReportGeneration(scanResponse),
					progressAnimation,
				]);

				setProgress(100);

				setIsScanLoading(true);

				markDownContent = response.data.response;
				const fileId = await saveFile({
					fileName: action,
					fileUrl: "randomUrl",
					folderId: folderId as Id<"reportFolders">,
					reportType: "vulnerabilityReport",
					markdownContent: markDownContent,
				});

				const fileLink = `/file/${fileId}`;
				const message = `Report saved successfully. Click [here](${fileLink}) to view the report.`;

				addBotMessage(message);
			} catch (error) {
				return error;
			} finally {
				setIsScanLoading(false);
			}
		} else if (type === "chat-summary-create-file" && action) {
			let markDownContent = "";
			try {
				setPendingAction(null);
				setIsScanLoading(true);
				setProgress(0);
				if (!chatSummaryContent) {
					throw new Error("No chat summary available");
				}
				markDownContent = chatSummaryContent;
			} catch (error) {
				return error;
			} finally {
				setIsScanLoading(false);
			}
			const fileId = await saveFile({
				fileName: action,
				fileUrl: "randomUrl",
				folderId: folderId as Id<"reportFolders">,
				reportType: "chatSummaryReport",
				markdownContent: markDownContent,
			});
			const fileLink = `/file/${fileId}`;
			const message = `Report saved successfully. Click [here](${fileLink}) to view the report.`;
			setChatSummaryContent("");
			addBotMessage(message);
			setPendingAction(null);
		}
	};
	const streamChatResponse = async (
		userMessage: Message,
		responseStream: StreamResponse,
		action?: string,
	) => {
		try {
			setStreaming(true);
			if (!responseStream.ok || !responseStream.body) {
				throw new Error("Failed to get response stream");
			}

			const reader = responseStream.body.getReader();
			const decoder = new TextDecoder();
			let accumulatedMessage = "";

			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					await completeMessage();
					const botMessage: Message = {
						id: uuidv4(),
						message: accumulatedMessage,
						sender: "ai",
					};

					handleMessagesUpdate([userMessage, botMessage]);
					if (action === "Chat Summary Report") {
						setChatSummaryContent(accumulatedMessage);
						await saveSummary({
							userId: String(user?.id),
							title: `Chat Summary - ${new Date().toLocaleDateString()}`,
							content: accumulatedMessage,
						});
					}

					break;
				}

				// Decode and append new chunk
				const chunk = decoder.decode(value, { stream: true });
				accumulatedMessage += chunk;

				// Update UI with accumulated message
				updateUI(accumulatedMessage);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			addBotMessage(`Error: ${errorMessage}`);
		} finally {
			setStreaming(false);
		}
	};

	const yesClicked = async (confirmType: string) => {
		setPendingAction(null);
		const userMessage: Message = {
			id: uuidv4(),
			message: "Yes",
			sender: "user",
		};
		setMessages((prev) => [...prev, userMessage]);
		if (confirmType === "report") {
			await saveChatMessage({
				humanInTheLoopId: userMessage.id,
				chatId: chatId
					? (chatId as Id<"chats">)
					: (createdChatId as Id<"chats">),
				sender: userMessage.sender,
				message: userMessage.message,
			});

			try {
				setIsLoading(true);
				//report generation api call
				const responseStream =
					await scanApis.scanReportGeneration(scanResponse);
				setIsLoading(false);

				await streamChatResponse(userMessage, responseStream);

				const manualMessage = "Do you want to save this as a detailed report?";
				const botMessage: Message = {
					id: uuidv4(),
					message: manualMessage,
					sender: "ai",
				};

				await saveChatMessage({
					chatId: createdChatId
						? (createdChatId as Id<"chats">)
						: (chatId as Id<"chats">),
					humanInTheLoopId: botMessage.id,
					sender: botMessage.sender,
					message: botMessage.message,
				});

				setPendingAction(botMessage.id as string);
				setRequestHumanInLoop({
					action: "approval",
					prompt: manualMessage,
					type: "save",
					id: botMessage.id,
				});
				requestHumanApproval("approval", manualMessage, "save", botMessage.id);
			} catch (error) {
				return error;
			}
		} else if (confirmType === "save") {
			await saveChatMessage({
				humanInTheLoopId: userMessage.id,
				chatId: chatId
					? (chatId as Id<"chats">)
					: (createdChatId as Id<"chats">),
				sender: userMessage.sender,
				message: userMessage.message,
			});
			const manualMessage = "Thank you for folder name";
			const botMessage: Message = {
				id: uuidv4(),
				message: manualMessage,
				sender: "ai",
			};
			await saveChatMessage({
				chatId: createdChatId
					? (createdChatId as Id<"chats">)
					: (chatId as Id<"chats">),
				humanInTheLoopId: botMessage.id,
				sender: botMessage.sender,
				message: botMessage.message,
			});

			setPendingAction(botMessage.id as string);
			setRequestHumanInLoop({
				action: "folder",
				prompt: manualMessage,
				type: "none",
				id: botMessage.id,
			});
			requestHumanApproval("folder", manualMessage, "none", botMessage.id);
		} else if (confirmType === "save-chat-summary") {
			await saveChatMessage({
				humanInTheLoopId: userMessage.id,
				chatId: chatId
					? (chatId as Id<"chats">)
					: (createdChatId as Id<"chats">),
				sender: userMessage.sender,
				message: userMessage.message,
			});

			const manualMessage = "Select a folder to save the summary report.";
			const botMessage: Message = {
				id: uuidv4(),
				message: manualMessage,
				sender: "ai",
			};
			await saveChatMessage({
				chatId: createdChatId
					? (createdChatId as Id<"chats">)
					: (chatId as Id<"chats">),
				humanInTheLoopId: botMessage.id,
				sender: botMessage.sender,
				message: botMessage.message,
			});

			setPendingAction(botMessage.id as string);
			setRequestHumanInLoop({
				action: "save-chat-summary",
				prompt: manualMessage,
				type: "summary",
				id: botMessage.id,
			});

			requestHumanApproval(
				"save-chat-summary",
				manualMessage,
				"summary",
				botMessage.id,
			);
		}
	};

	const cancelAction = async () => {
		setPendingAction(null);
		const userMessage: Message = {
			id: uuidv4(),
			message: "No",
			sender: "user",
		};
		await saveChatMessage({
			humanInTheLoopId: userMessage.id,
			chatId: chatId ? (chatId as Id<"chats">) : (createdChatId as Id<"chats">),
			sender: userMessage.sender,
			message: userMessage.message,
		});
		setChatSummaryContent("");
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

	const generateTitle = async (botMessage: string) => {
		try {
			const { data } = await chatApis.generateTitle({
				botMessage: botMessage,
			});

			return { title: data.response, userId: user?.id };
		} catch (error) {
			return error;
		}
	};

	const handleActionSend = (action: string, useRAG?: boolean) => {
		handleSend(action, useRAG);
	};

	const handleSend = async (message?: string, useRAG?: boolean) => {
		const finalMessage = message || input.trim();
		if (finalMessage) {
			const userMessage: Message = {
				id: uuidv4(),
				message: finalMessage,
				sender: "user",
			};
			setMessages((prev) => [...prev, userMessage]);
			setInput("");
			if (createdChatId || chatId) {
				// setFetchRegularly(false);
				setFetchChatsRegurlarly(false);
				try {
					await saveChatMessage({
						humanInTheLoopId: userMessage.id,
						chatId: createdChatId
							? (createdChatId as Id<"chats">)
							: (chatId as Id<"chats">),
						sender: userMessage.sender,
						message: userMessage.message,
					});
					processPrompt(userMessage, useRAG);
				} catch (error) {
					return error;
				}
			} else {
				processPrompt(userMessage, useRAG);
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

	const handleMessagesUpdate = async (updatedMessages: Message[]) => {
		const lastMessage = updatedMessages[updatedMessages.length - 1];
		if (!chatId && !createdChatId) {
			const response = await handleTitleGeneration(lastMessage.message);
			const result = await saveChat({
				userId: String((response as { userId: string }).userId),
				title: (response as { title: string })?.title,
			});
			setCreatedChatId(result);

			// Save all messages
			for (const msg of updatedMessages) {
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
		} else {
			// Handle existing chat
			const targetChatId = createdChatId || chatId;

			if (targetChatId) {
				await saveChatMessage({
					humanInTheLoopId: lastMessage.id,
					chatId: targetChatId as Id<"chats">,
					sender: "ai",
					message: lastMessage.message,
				});
			}
		}
	};

	const completeMessage = async () => {
		setMessages((prev) => {
			const updatedMessages = prev.map((msg) =>
				msg.isStreaming ? { ...msg, isStreaming: false } : msg,
			);

			return updatedMessages;
		});
	};

	const handleFileCreation = async (
		selectedAction: string,
		action: RequestHumanInLoop | null,
	) => {
		if (action) {
			await confirmAction(selectedAction, action.type ?? "create-file");
		}
	};

	return (
		<div className="flex justify-center">
			<div className="flex flex-col space-y-3 sm:w-3/4 md:w-4/5 lg:w-3/5 h-[90vh] rounded-lg">
				{messages?.length === 0 ? (
					<>
						<div className="flex flex-col items-center w-full h-1/3">
							<motion.div
								className="w-full max-w-2/4 aspect-w-1 aspect-h-1 justify-center mb-10"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.25 }}
							>
								<img
									src={MiraAvatar}
									alt="Avatar"
									className="flex w-auto h-full object-cover justify-self-center mt-10"
								/>
							</motion.div>

							<motion.div
								className="flex text-center text-2xl sm:text-3xl font-semibold mt-auto space-x-3 mb-6 mx-auto"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
							>
								<span className="flex items-center justify-between font-serif text-4xl mb-3 font-thin">
									{`${greeting}, ${user?.firstName || "User"}`}
								</span>
							</motion.div>
						</div>
					</>
				) : chatsLoader ? (
					<div className="flex items-center justify-center w-full h-full">
						<Spinner />
					</div>
				) : (
					<ScrollArea
						ref={scrollAreaRef}
						className="flex-1 p-4 w-full overflow-y-hidden"
					>
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
								) : actionType === "input" ? (
									<motion.div
										key={message.id}
										initial={{ opacity: 0, y: 50 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -50 }}
										transition={{ duration: 0.3 }}
									>
										<HumanInTheLoopInput
											key={message.id}
											message={humanInTheLoopMessage || ""}
											onConfirm={handleFileCreation}
											setShowInfo={setShowInfo}
											requestHumanInLoop={requestHumanInLoop ?? null}
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
											setShowInfo={setShowInfo}
											question={humanInTheLoopMessage || ""}
											actionPrompts={actionPrompts || []}
											onConfirm={confirmAction}
										/>
									</motion.div>
								);
							}

							const isUser = message.sender === "user";
							const messageClasses = `inline-block px-3 pt-3 rounded-xl max-w-[80%] sm:max-w-[100%] ${
								isUser
									? "bg-secondary dark:bg-primary-900 p-4 text-sm"
									: "text-foreground pr-4 overflow-y-auto text-pretty break-normal text-sm"
							}`;
							const containerClasses = `mb-4  ${isUser ? "text-right" : "text-left"}`;

							return (
								<motion.div
									key={message.id}
									className={containerClasses}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1, y: 0 }}
								>
									<div
										className={`items-center ${message.sender === "ai" ? "flex space-x-3" : ""}`}
									>
										{message.sender === "ai" && (
											<img
												src={mira_logo}
												alt="Avatar"
												className="w-5 h-5 mt-3 object-cover rounded-full justify-self-center mb-auto"
											/>
										)}

										<span className={`${messageClasses}`}>
											{isUser ? (
												message.message
											) : (
												<MarkdownViewer content={message.message} />
											)}
										</span>
									</div>
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
				{isScanLoading && (
					<div className="space-y-2">
						<Progress value={progress} className="w-full" />

						<p className="text-sm text-center text-gray-500">
							{progress === 95
								? "Almost done..."
								: `${progressLoaderMessage}: ${progress.toFixed(0)}%`}
						</p>
					</div>
				)}
				<div className="flex justify-center pt-auto px-0">
					<motion.div
						initial={{ width: "70%" }}
						animate={{ width: input ? "80%" : "70%" }}
						transition={{ duration: 0.3 }}
						className="flex items-center rounded-2xl px-4 py-2 relativ bg-secondary"
					>
						{/* Textarea */}
						<textarea
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
							className={`flex-1 resize-none text-sm bg-secondary border-none shadow-none rounded-full focus-visible:outline-none focus:ring-0 h-15 p-2 px-4 text-gray
                                ${(isLoading || !!pendingAction) && "cursor-not-allowed"}
                                `}
							placeholder="Ask Mira..."
							disabled={isLoading || !!pendingAction}
						/>

						<motion.button
							initial={{ opacity: 0, x: 20 }}
							animate={{
								opacity: input ? 1 : 0,
								x: input ? 0 : 20,
							}}
							transition={{ duration: 0.3 }}
							type="button"
							onClick={() => handleSend()}
							disabled={isLoading || !!pendingAction || streaming}
							className="ml-2 text-gray hover:text-primary bg-secondary rounded-full"
						>
							<SendIcon size={25} />
						</motion.button>
					</motion.div>
				</div>

				{messages.length === 0 ? (
					<div className="flex flex-col items-center gap-6 px-4">
						<motion.div
							className="flex flex-wrap justify-center items-center gap-4"
							layout // Ensures smooth animation for layout changes
						>
							{actionCards.map((actionCard, index) => (
								<motion.div
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={index}
									className="flex items-center space-x-2 bg-sidebar border p-3 rounded-full shadow-sm cursor-pointer hover:shadow-md transition-all"
									whileHover={{ scale: 1.05 }} // Hover animation
									whileTap={{ scale: 0.95 }} // Tap animation
									onClick={() => {
										handleActionSend(actionCard.title, actionCard.useRAG);
									}}
								>
									<actionCard.icon className="h-5 w-5 text-[#7156DB]" />
									<span className="text-sm font-medium">
										{actionCard.title}
									</span>
								</motion.div>
							))}
						</motion.div>
						{/* Show More Button */}
						{!showMore && (
							<motion.div
								className="flex items-center space-x-2 bg-sidebar border p-3 rounded-full shadow-sm cursor-pointer hover:shadow-md transition-all"
								onClick={() => {
									setShowMore(true);
								}} // Toggle showMore state
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<MoreHorizontal className="h-5 w-5 text-[#7156DB]" />
								<span className="text-sm font-medium">More</span>
							</motion.div>
						)}
						{/* Reveal More Cards */}
						<AnimatePresence>
							{showMore && (
								<motion.div
									className="flex flex-wrap justify-center items-center gap-4"
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
								>
									{moreCards.map((moreCard, index) => (
										<motion.div
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											key={index}
											className="flex items-center space-x-2 bg-sidebar border p-3 rounded-full shadow-sm cursor-pointer hover:shadow-md transition-all"
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											onClick={() => handleActionSend(moreCard.title)}
										>
											<moreCard.icon className="h-5 w-5 text-[#7156DB]" />
											<span className="text-sm font-medium">
												{moreCard.title}
											</span>
										</motion.div>
									))}
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				) : null}

				<Dialog open={showInfo} onOpenChange={setShowInfo}>
					<DialogContent className="dialog-content">
						<DialogHeader>
							<DialogTitle className="dialog-title">Information</DialogTitle>
						</DialogHeader>
						<ScrollArea
							style={{
								maxHeight: "400px",
								width: "100%",
								overflowY: "auto",
								scrollbarWidth: "thick",
								scrollbarColor: "#888 #f0f0f0",
							}}
						>
							<div
								className="dialog-body"
								// style={{
								// 	maxHeight: "400px",
								// 	overflowY: "auto",
								// 	padding: "10px",
								// 	scrollbarWidth: "auto",
								// 	scrollbarColor: "#888 #f0f0f0",
								// }}
							>
								{info.map((item) => (
									<div key={item.id} className="info-item">
										<h2 className="text-lg font-semibold">{item.name}</h2>
										<p className="info-description">
											{item.description || "No description available."}
										</p>
									</div>
								))}
							</div>
						</ScrollArea>
					</DialogContent>
				</Dialog>
			</div>
			<CreateFolderDialog
				open={isCreateDialogOpen}
				humanInTheLoopAction={requestHumanInLoop}
				onOpenChange={setIsCreateDialogOpen}
				onCreateFolder={handleCreateFolder}
			/>
		</div>
	);
};

export default MiraChatBot;
