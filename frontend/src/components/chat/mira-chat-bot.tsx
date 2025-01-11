import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

//components
// import { ChatActions } from "@components/chat/chat-actions";
// import { Textarea } from "@components/ui/textarea";
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

// svgs
import MiraAvatar from "../../assets/Mira.svg";
import { SendIcon } from "lucide-react";

// types
import type { Message, ChatHistory, Info } from "../../types/chats";
import type { FolderItem, FolderType } from "../../types/reports";

//constants

import { scanApis } from "../../api/scan";
import useScanStore from "../../store/scanStore";
import MarkdownViewer from "../file/MarkdownViewer";
import {
	REPORT_GENERATION,
	URL_PATTERN,
	STANDARDS,
	REPORTS,
	NEGATION_PATTERNS,
	CLARIFICATION_PATTERNS,
	SCANTYPES,
} from "./constants";

const MiraChatBot: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [targetUrl, setTargetUrl] = useState<string | null>(null);
	const [scanType, setScanType] = useState<string | null>(null);
	const [actionType, setActionType] = useState<string | null>(null);
	const [confirmType, setConfirmType] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [streaming, setStreaming] = useState(false);
	const [info, setInfo] = useState<Info[]>([]);
	const [isScanLoading, setIsScanLoading] = useState(false);
	const [actionPrompts, setActionPrompts] = useState<
		{ id: string; name: string; type: string }[] | []
	>([]);
	const [humanInTheLoopMessage, setHumanInTheLoopMessage] = useState<
		string | null
	>(null);
	const [createdChatId, setCreatedChatId] = useState<Id<"chats"> | null>(
		null,
	);
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const { chatId: chatIdParam } = useParams<{ chatId: string }>();
	const chatId = chatIdParam as Id<"chats">;

	const [input, setInput] = useState("");

	const [pendingAction, setPendingAction] = useState<string | null>(null);
	const [foldersList, setFoldersList] = useState([] as FolderItem[]);
	// const [chatTitle, setChatTitle] = useState<string>("");

	const user = useStore((state) => state.user);
	const { scanResponse, setScanResponse } = useScanStore();

	if (!user) {
		return null;
	}
	const { id } = user;

	const [progress, setProgress] = useState(0);

	//chat apis convex APIs
	const chatData = useQuery(api.chats.getChatHistory, { chatId: chatId });
	const saveChatMessage = useMutation(api.chats.saveChatMessage);
	const saveChat = useMutation(api.chats.saveChat);
	const saveFile = useMutation(api.reports.addReport);
	const folderData = useQuery(api.reports.getReportFoldersByUser, {
		userId: String(id),
	});
	const saveSummary = useMutation(api.summaries.saveSummary);

	// biome-ignore lint/correctness/useExhaustiveDependencies: all dependencies not needed
	useEffect(() => {
		handleScrollToBottom();
	}, [messages]);

	useEffect(() => {
		let mounted = true;
		if (chatData && mounted) {
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
		if (folderData && mounted) {
			const newFolders: FolderItem[] = folderData.map(
				(item: FolderType): FolderItem => ({
					id: item._id,
					name: item.folderName,
					type: "folder",
				}),
			);

			setFoldersList(newFolders);
		}
		return () => {
			mounted = false;
		};
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

	const processPrompt = async (userMessage: Message) => {
		const lowerPrompt = userMessage.message.toLowerCase().trim();
		const extractURLs = (text: string): string[] => {
			const urlRegex = /(https?:\/\/[^\s]+)/g;
			return text.match(urlRegex) || [];
		};
		const hasURL = URL_PATTERN.test(lowerPrompt);
		const hasNegation = NEGATION_PATTERNS.some((pattern) =>
			pattern.test(lowerPrompt),
		);
		const isClarification = CLARIFICATION_PATTERNS.test(lowerPrompt);
		const isReportRequest = new RegExp(
			REPORT_GENERATION.map((keyword) => `\\b${keyword}\\b`).join("|"),
			"i",
		).test(lowerPrompt);

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
			streamChatResponse(userMessage, responseStream);
			setIsLoading(true);
			setIsLoading(false);
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
		} else if (isReportRequest) {
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
			requestHumanApproval(
				"report",
				manualMessage,
				"none",
				botMessage.id,
			);
		} else {
			//handled properly

			try {
				setIsLoading(true);
				const responseStream = (await chatApis.chat({
					message: userMessage.message,
					useRAG: false,
				})) as StreamResponse;
				streamChatResponse(
					userMessage,
					responseStream as StreamResponse,
				);
			} catch (error) {
				return error;
			} finally {
				setIsLoading(true);
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
		action: string,
		prompt: string,
		type?: string,
		id?: string,
	) => {
		let approvalMessage = "";
		if (action === "scan") {
			approvalMessage =
				"Select your preferred scan type. You can choose from the following:";
			setActionPrompts(SCANTYPES);
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
			setHumanInTheLoopMessage(approvalMessage);
		} else if (action === "approval") {
			approvalMessage = prompt;
			setActionPrompts([]);
			setHumanInTheLoopMessage(approvalMessage);
		} else if (action === "folder") {
			approvalMessage =
				"Select the folder where you want to save the report.";
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

	const [showInfo, setShowInfo] = useState(false);

	const confirmAction = async (
		action: string,
		type: string,
		actionId: string,
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
				const manualMessage =
					"Thank you for providing the scan type. Please select the standard you want to scan against.";
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

				requestHumanApproval(
					"standards",
					manualMessage,
					"none",
					botMessage.id,
				);
			} catch {
				addBotMessage(
					"An error occurred while processing your request.",
				);
			}
		} else if (type === "standards") {
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

				try {
					const payload = {
						url: targetUrl as string,
						complianceStandard: action as string,
						scanType: scanType as string,
						userId: Number(id),
					};
					setPendingAction(null);
					setIsScanLoading(true);
					setProgress(0);
					const response = await scanApis.scanWithProgress(
						payload,
						(progress) => {
							setProgress(progress);
						},
					);
					setScanResponse(response.data);

					setIsScanLoading(false);
					addBotMessage(
						`Scan completed using **${response.data.complianceStandardUrl}**. Found **${response.data.totals.totalIssues}** vulnerabilities.`,
					);
				} catch (error) {
					addBotMessage(
						"An error occurred while processing your request.",
					);
					return error;
				}

				const manualMessage =
					"Do you want to generate a brief summary?";
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
				requestHumanApproval(
					"approval",
					manualMessage,
					"report",
					botMessage.id,
				);
			} catch {
				addBotMessage(
					"An error occurred while processing your request.",
				);
			}
		} else if (type === "report") {
			if (action === "Chat Summary Report") {
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
				const manualMessage = "Thank you for providing the report type";
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
				addBotMessage("Report generation in progress...");
				// await handleGenerateSummary(messages, true); // Use Ollama
				// or
				await handleGenerateSummary(messages, false); // Use OpenAI

				// requestHumanApproval("folder", manualMessage, "report", botMessage.id);
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
				const manualMessage = "Thank you for providing the report type";
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
				addBotMessage("Vulnerability generation in progress...");
			}
		} else if (type === "folder") {
			// Folder selection

			let markDownContent = "";
			try {
				setPendingAction(null);
				setIsScanLoading(true);
				setProgress(0);

				const response = await scanApis.detailedReportGeneration(
					scanResponse,
					(progress) => {
						setProgress(progress);
					},
				);

				markDownContent = response.data.response;
			} catch (error) {
				return error;
			} finally {
				setIsScanLoading(false);
			}

			const fileId = await saveFile({
				fileName: "Vulnerability Report",
				fileUrl: "randomUrl",
				folderId: actionId as Id<"reportFolders">,
				markdownContent: markDownContent,
			});

			const fileLink = `/file/${fileId}`;
			const message = `Report saved successfully. Click [here](${fileLink}) to view the report.`;

			addBotMessage(message);

			setPendingAction(null);
		} else {
			addBotMessage(`${type} In progress...`);
		}
	};

	const streamChatResponse = async (
		userMessage: Message,
		responseStream: StreamResponse,
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
				error instanceof Error
					? error.message
					: "Unknown error occurred";
			addBotMessage(`Error: ${errorMessage}`);
		} finally {
			setIsLoading(false);
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
		if (confirmType === "report") {
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
				setIsLoading(true);
				//report generation api call
				const responseStream =
					await scanApis.scanReportGeneration(scanResponse);
				setIsLoading(false);

				// await streamOllamaChatResponse(responseStream);
				await streamChatResponse(userMessage, responseStream);

				const manualMessage =
					"Do you want to save this as a detailed report?";
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
				requestHumanApproval(
					"approval",
					manualMessage,
					"save",
					botMessage.id,
				);
			} catch (error) {
				return error;
			}
		} else if (confirmType === "save") {
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
			const manualMessage =
				"Create a new folder. Or select an existing folder to save the report.";
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
			requestHumanApproval(
				"folder",
				manualMessage,
				"none",
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

	const generateTitle = async (botMessage: string) => {
		try {
			const { data } = await chatApis.generateTitle({
				botMessage: botMessage,
			});

			return { title: data.response, userId: id };
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
				return [
					...prev.slice(0, -1),
					{ ...lastMessage, message: message },
				];
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

	

	const streamChatSummaryResponse = async (
		responseStream: ReadableStream<Uint8Array>,
	) => {
		try {
			const reader = responseStream.getReader();
			const decoder = new TextDecoder();
			let accumulatedMessage = "";
			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					// Save the summary to Convex after streaming is complete
					try {
						await saveSummary({
							userId: String(id),
							title: `Chat Summary - ${new Date().toLocaleDateString()}`,
							content: accumulatedMessage,
						});
					} catch (error) {
						addBotMessage(
							`Summary generated but there was an error saving it. ${error}`,
						);
					}
					completeMessage();
					break;
				}

				const chunk = decoder.decode(value, { stream: true });
				buffer += chunk;

				// Process complete JSON objects
				while (buffer.includes("\n")) {
					const newlineIndex = buffer.indexOf("\n");
					const line = buffer.slice(0, newlineIndex).trim();
					buffer = buffer.slice(newlineIndex + 1);

					if (!line) continue;

					try {
						const parsed = JSON.parse(line);
						if (parsed?.response) {
							accumulatedMessage += parsed.response;
							updateUI(accumulatedMessage);
						}
					} catch (error) {
						throw new Error(
							`Skipping malformed JSON: ${line} and got ${error}`,
						);
					}
				}
			}
		} finally {
			setStreaming(false);
			setIsLoading(false);
		}
	};

	const handleGenerateSummary = async (
		messages: Message[],
		useOllama: boolean,
	) => {
		setIsLoading(true);
		try {
			// If we don't have a chat title, try to fetch it
			// if (!chatTitle && chatData?.[0]?.title) {
			// 	setChatTitle(chatData[0].title);
			// }
			const payload = { messages: messages.map((msg) => msg.message) };
			if (useOllama) {
				const responseStream =
					await chatApis.chatSummaryOllama(payload);
				await streamChatSummaryResponse(responseStream);
			} else {
				// For OpenAI
				const response = await chatApis.chatSummaryOpenAI(payload);
				await streamChatSummaryOpenAIResponse(response);
			}
		} catch (error) {
			addBotMessage(
				`Error generating chat summary. Please try again. ${error}`,
			);
		} finally {
			setIsLoading(false);
		}
	};
	const streamChatSummaryOpenAIResponse = async (response: Response) => {
		try {
			const reader = response.body?.getReader();
			if (!reader) throw new Error("No reader available");

			const decoder = new TextDecoder();
			let accumulatedMessage = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					// Save the summary to Convex after streaming is complete
					try {
						await saveSummary({
							userId: String(id),
							title: `Chat Summary - ${new Date().toLocaleDateString()}`,
							content: accumulatedMessage,
						});
					} catch (error) {
						addBotMessage(
							`Summary generated but there was an error saving it. ${error}`,
						);
					}
					completeMessage();
					break;
				}

				// Decode the chunk
				const chunk = decoder.decode(value);

				// Split by newlines and process each line
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (!line.trim()) continue;

					try {
						// Parse the JSON from the line
						const data = JSON.parse(line);

						// Extract the content from the parsed data
						if (data.choices?.[0]?.delta?.content) {
							accumulatedMessage += data.choices[0].delta.content;
							updateUI(accumulatedMessage);
						}
					} catch (error) {
						addBotMessage(
							`Error processing summary stream: ${error}`,
						);
					}
				}
			}
		} catch (error) {
			addBotMessage(`Error processing summary stream ${error}`);
		} finally {
			setStreaming(false);
			setIsLoading(false);
		}
	};

	return (
		<div className="flex justify-center">
			<div className="flex flex-col space-y-6 w-3/4 h-full md:h-[90vh] rounded-lg p-4">
				{!chatData ? (
					<div className="flex items-center justify-center w-full h-full">
						<Spinner />
					</div>
				) : chatData && messages.length === 0 ? (
					<>
						<div className="flex flex-col items-center justify-center w-full h-2/4">
							<motion.div
								className="w-full max-w-2/4 aspect-w-1 aspect-h-1 justify-center mt-20"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.25 }}
							>
								<img
									src={MiraAvatar}
									alt="Avatar"
									className="flex w-auto h-auto object-cover justify-self-center"
								/>
							</motion.div>
							<motion.h1
								className="text-2xl font-semibold justify-center text-primary"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.25 }}
							>
								Need a Security Checkup?
							</motion.h1>
						</div>
					</>
				) : (
					<ScrollArea
						ref={scrollAreaRef}
						className="flex-1 p-4  w-full"
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
											message={
												humanInTheLoopMessage || ""
											}
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
											setShowInfo={setShowInfo}
											question={
												humanInTheLoopMessage || ""
											}
											actionPrompts={actionPrompts || []}
											onConfirm={confirmAction}
										/>
									</motion.div>
								);
							}

							const isUser = message.sender === "user";
							const messageClasses = `inline-block p-2 rounded-lg ${
								isUser
									? "bg-primary text-primary-foreground dark:bg-primary-900"
									: "bg-muted dark:bg-muted/40 text-foreground"
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
											<MarkdownViewer
												content={message.message}
											/>
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
				{isScanLoading && (
					<div className="space-y-2">
						<Progress value={progress} className="w-full" />

						<p className="text-sm text-center text-gray-500">
							{progress === 100
								? "Scanning completed... Please wait"
								: `Scan in progress: ${progress.toFixed(0)}%`}
						</p>
					</div>
				)}
				<div className="flex justify-center">
					<motion.div
						initial={{ width: "60%" }}
						animate={{ width: input ? "70%" : "60%" }}
						transition={{ duration: 0.3 }}
						className="flex items-center rounded-full px-4 py-2 relativ bg-secondary"
					>
						{/* Textarea */}
						<textarea
							// ref={inputRef}
							value={input}
							onChange={(
								e: React.ChangeEvent<HTMLTextAreaElement>,
							) => setInput(e.target.value)}
							onKeyPress={(
								e: React.KeyboardEvent<HTMLTextAreaElement>,
							) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSend();
								}
							}}
							className="flex-1 resize-none text-sm bg-secondary border-none shadow-none rounded-full focus-visible:outline-none focus:ring-0 h-15 p-2 px-4 text-gray"
							placeholder="Ask Mira..."
							disabled={isLoading || !!pendingAction}
						/>

						{/* Animated Send Button */}
						<motion.button
							initial={{ opacity: 0, x: 20 }}
							animate={{
								opacity: input ? 1 : 0,
								x: input ? 0 : 20,
							}}
							transition={{ duration: 0.3 }}
							type="button"
							onClick={handleSend}
							disabled={isLoading || !!pendingAction || streaming}
							className="ml-2 text-gray hover:text-primary bg-secondary p-4 rounded-full"
						>
							<SendIcon size={25} />
						</motion.button>
					</motion.div>
				</div>

				<Dialog open={showInfo} onOpenChange={setShowInfo}>
					<DialogContent className="dialog-content">
						<DialogHeader>
							<DialogTitle className="dialog-title">
								Information
							</DialogTitle>
						</DialogHeader>
						<div className="dialog-body">
							{info.map((item) => (
								<div key={item.id} className="info-item">
									<h2 className="text-lg font-semibold">
										{item.name}
									</h2>
									<p className="info-description">
										{item.description ||
											"No description available."}
									</p>
								</div>
							))}
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
};

export default MiraChatBot;
