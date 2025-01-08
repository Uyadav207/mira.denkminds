import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

//components
import { ChatActions } from "@components/chat/chat-actions";
import { Textarea } from "@components/ui/textarea";
import { ScrollArea } from "@components/ui/scroll-area";
import { Spinner } from "@components/loader/spinner";
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

const MiraChatBot: React.FC = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [actionType, setActionType] = useState<string | null>(null);
	const [confirmType, setConfirmType] = useState<string | null>(null);
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
			_id: uuidv4(),
			folderName: name,
			files: [],
			createdAt: new Date(),
		};

		const response = await saveReport({
			folderName: newFolder.folderName,
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
			requestHumanApproval(
				"report",
				manualMessage,
				"none",
				botMessage.id,
			);
		} else {
			//handled properly
			streamChatResponse(userMessage.message);
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

	const confirmAction = async (action: string, type: string) => {
		if (!pendingAction) return;

		const userMessage: Message = {
			id: uuidv4(),
			message: action,
			sender: "user",
		};

		if (type === "scan") {
			//integration with scan api
			try {
				//do scan api call here

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
				addBotMessage("SCANNED RESULT USING SINDURA'S API...");
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
				addBotMessage(
					"An error occurred while processing your request.",
				);
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
			addBotMessage(`${confirmType} Generated`);
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
				"report",
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
		// setPendingAction(null);
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
				} finally {
					setInput("");
				}
			} else {
				processPrompt(userMessage);
				setInput("");
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

	const completeMessage = async () => {
		let latestmessage: Message[] = [];
		setMessages((prev) => {
			const updatedMessages = prev.map((msg) =>
				msg.isStreaming ? { ...msg, isStreaming: false } : msg,
			);
			latestmessage = updatedMessages;
			return updatedMessages;
		});

		if (latestmessage.length === 2 && !chatId) {
			const response = await handleTitleGeneration(latestmessage);
			// const result = await saveChat({
			// 	userId: String(response?.userId as),
			// 	title: response?.title,
			// });

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

	const streamChatResponse = async (prompt: string) => {
		try {
			setIsLoading(true);
			const responseStream = await chatApis.chat({ prompt });
			setIsLoading(false);

			const reader = responseStream.getReader();
			const decoder = new TextDecoder();
			let accumulatedMessage = "";
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					completeMessage();

					break;
				}

				const chunk = decoder.decode(value, { stream: true });
				const lines = chunk
					.split("\n")
					.filter((line) => line.trim() !== "");

				for (const line of lines) {
					try {
						const parsed = JSON.parse(line);
						if (parsed.response) {
							accumulatedMessage += parsed.response;
							updateUI(accumulatedMessage);
						}
					} catch (error) {
						return error;
					}
				}
			}
		} catch (error) {
			addBotMessage(
				"Oops! Something went wrong while streaming the response.",
			);
			return error;
		} finally {
			setIsLoading(false);
			// setIsStreaming(false);
		}
	};

	return (
		<div className="flex flex-col space-y-6 p-4 w-full h-full md:h-[90vh] rounded-lg shadow-lg bg-muted/50">
			{!chatData ? (
				<div className="flex items-center justify-center w-full h-full">
					{/* <Spinner /> */}
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
				<ScrollArea
					ref={scrollAreaRef}
					className="flex-1 p-4 bg-gray-50 w-full"
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
							isUser
								? "bg-black text-white"
								: "bg-gray-200 text-black mt-10"
						}`;
						const containerClasses = `mb-4 ${isUser ? "text-right" : "text-left"}`;

						return (
							<motion.div
								key={message.id}
								className={containerClasses}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
							>
								<span className={messageClasses}>
									{isUser ? (
										message.message
									) : (
										<ReactMarkdown>
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
			<div className="flex items-center w-full rounded-lg px-4 py-2 shadow-sm border">
				<img src={MiraLogo} alt="Logo" className="w-7 h-7 mr-2" />
				<Textarea
					value={input}
					onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
						setInput(e.target.value)
					}
					onKeyPress={(
						e: React.KeyboardEvent<HTMLTextAreaElement>,
					) => {
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
