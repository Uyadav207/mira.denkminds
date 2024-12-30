import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

import { ChatActions } from "@components/chat/chat-actions";
import { Textarea } from "@components/ui/textarea";
import { ScrollArea } from "@components/ui/scroll-area";
// import { Card, CardContent } from "@components/ui/card";
import { Spinner } from "@components/loader/spinner";

// import { HumanInTheLoop } from "./human-in-the-loop";

// svg
import MiraLogo from "../../assets/MiraLogo.svg";
import MiraAvatar from "../../assets/Mira.svg";

// types
import type { Message } from "../../types/message";
import {
	// INITIAL_ACTION_CARDS,
	REPORT_GENERATION,
	// UPDATED_ACTION_CARDS,
	URL_PATTERN,
} from "./constants";
import { VulnerabilityStandards } from "./vulnerability-standards";
import { chatApis } from "../../api/chat";
import { HumanInTheLoop } from "./human-in-the-loop";
import { CreateFolderDialog } from "../folder/CreateFolderDialog";
import type { Folder } from "../../types/reports";

const MiraChatBot: React.FC = () => {
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading] = useState(false);
	// const [actionCards, setActionCards] = useState(INITIAL_ACTION_CARDS);
	const [pendingAction, setPendingAction] = useState<string | null>(null); // For confirmation
	const [folders, setFolders] = useState<Folder[]>([]);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies(messages): Intentionally used to trigger behaviour.
	useEffect(() => {
		if (scrollAreaRef.current) {
			const scrollContainer = scrollAreaRef.current.querySelector(
				"[data-radix-scroll-area-viewport]",
			);
			if (scrollContainer) {
				scrollContainer.scrollTop = scrollContainer.scrollHeight;
			}
		}
	}, [messages]);

	const handleCreateFolder = (name: string) => {
		const newFolder: Folder = {
			id: crypto.randomUUID(),
			name,
			files: [],
			createdAt: new Date(),
		};
		setFolders([...folders, newFolder]);
	};

	// const handleCardClick = (title: string, prompt: string) => {
	// 	// Default bot response
	// 	let botResponse = "";
	// 	let updatedActionCards: typeof actionCards = [];

	// 	// Logic to dynamically update action cards
	// 	if (title.includes("Get Started")) {
	// 		botResponse = "Welcome! What would you like to do next?";
	// 		updatedActionCards = [...UPDATED_ACTION_CARDS];
	// 	} else if (title.includes("Scan Website")) {
	// 		botResponse = "Please provide the URL you want me to analyze.";
	// 		updatedActionCards = [...UPDATED_ACTION_CARDS];
	// 	} else if (title.includes("Report Generation")) {
	// 		botResponse = "Please select a report type to generate.";
	// 		updatedActionCards = [...UPDATED_ACTION_CARDS];
	// 	} else {
	// 		botResponse = "Here are some general actions you can take:";
	// 		updatedActionCards = [...INITIAL_ACTION_CARDS];
	// 	}

	// 	const newMessage: Message = { id: uuidv4(), text: prompt, sender: "bot" };
	// 	setMessages((prev) => [...prev, newMessage]);

	// 	setInput("");

	// 	setActionCards(updatedActionCards);
	// };

	const processPrompt = async (prompt: string) => {
		const lowerPrompt = prompt.toLowerCase().trim();

		const containsURL = URL_PATTERN.test(lowerPrompt);
		const containsReportGeneration = REPORT_GENERATION.some((keyword) =>
			lowerPrompt.includes(keyword),
		);
		if (containsURL) {
			requestHumanApproval(
				"scan",
				"Which of the following standards would you like to use for the scan?",
			);
		} else if (containsReportGeneration) {
			requestHumanApproval("report", prompt);
		} else {
			streamChatResponse(prompt);
			// setIsLoading(true);
			// try {
			// 	const response = await chatApis.chat({ prompt: prompt });
			// 	addBotMessage(response.data.message);
			// } catch (error) {
			// 	console.log("error");
			// } finally {
			// 	setIsLoading(false);
			// }
		}
	};
	const requestHumanApproval = (
		actionType: string,
		prompt: string,
		confirmType?: string,
	) => {
		let approvalMessage = "";
		if (actionType === "scan") {
			approvalMessage =
				"Select your preferred standard for the scan. You can choose from the following:";
		} else if (actionType === "report") {
			approvalMessage = "What type of report do you want to generate?";
		} else if (actionType === "approval") {
			approvalMessage = "Do you want to generate a Report?";
		} else if (actionType === "folder") {
			approvalMessage =
				"Select the folder where you want to save the report.";
		}
		const approvalMessageObject: Message = {
			id: uuidv4(),
			text: prompt,
			actionPrompts:
				actionType === "scan"
					? standards
					: actionType === "report"
						? reports
						: actionType === "folder"
							? foldersList
							: [],
			sender: "bot",
			humanInTheLoop: true,
			actionType: actionType,
			confirmType: confirmType,
			humanInTheLoopMessage: approvalMessage,
		};

		setPendingAction(approvalMessageObject.id);

		setMessages((prev) => [...prev, approvalMessageObject]);
	};

	const confirmAction = async (standard: string, type: string) => {
		if (!pendingAction) return;

		if (type === "scan") {
			//integration with scan api
			try {
				const userMessage: Message = {
					id: uuidv4(),
					text: standard,
					sender: "user",
				};
				setMessages((prev) => [...prev, userMessage]);
				//do scan api call here
				addBotMessage(`${type} in progress...`);

				requestHumanApproval(
					"approval",
					"Do you want to generate a report?",
					"report",
				);
			} catch {
				// console.error("Error confirming action:", error);
				addBotMessage(
					"An error occurred while processing your request.",
				);
			} finally {
				// Reset pending action
			}
		} else if (type === "report") {
			addBotMessage(`${type} In progress...`);
		} else if (type === "folder") {
			// Folder selection
			if (standard === "Create New Folder") {
				// Show modal to create a new folder
				setIsCreateDialogOpen(true);
				// requestHumanApproval("file", "Please provide a name for the report.");

				// handleFileCreationModal()
			} else {
				// Save the report in the selected folder
				// finalizeReportGeneration()
			}
		} else {
			// Report generation

			addBotMessage(`${type} In progress...`);
		}
	};

	const yesClicked = (confirmType: string) => {
		if (confirmType === "report") {
			const userMessage: Message = {
				id: uuidv4(),
				text: "Yes",
				sender: "user",
			};
			setMessages((prev) => [...prev, userMessage]);
			addBotMessage(`${confirmType} Generation in progress...`);

			requestHumanApproval(
				"folder",
				"Create a new folder. Or select an existing folder to save the report.",
			);
			// handleFileCreationModal()
		}
	};

	const cancelAction = () => {
		addBotMessage("Action cancelled. How else can I assist you?");
		const userMessage: Message = {
			id: uuidv4(),
			text: "Yes",
			sender: "user",
		};
		setMessages((prev) => [...prev, userMessage]);
		setPendingAction(null);
	};

	const addBotMessage = (text: string) => {
		const botMessage: Message = { id: uuidv4(), text, sender: "bot" };
		setMessages((prev) => [...prev, botMessage]);
	};

	const handleSend = async () => {
		if (input.trim()) {
			const userMessage: Message = {
				id: uuidv4(),
				text: input,
				sender: "user",
			};
			setMessages((prev) => [...prev, userMessage]);
			processPrompt(input);
			// await streamChatResponse(input);
			setInput("");
		}
	};

	const updateUI = (message: string) => {
		setMessages((prev) => {
			const lastMessage = prev[prev.length - 1];
			if (lastMessage?.sender === "bot" && lastMessage.isStreaming) {
				// Update the existing streaming message
				return [
					...prev.slice(0, -1),
					{ ...lastMessage, text: message },
				];
			}
			// Add a new streaming message
			return [
				...prev,
				{
					id: uuidv4(),
					text: message,
					sender: "bot",
					isStreaming: true,
				},
			];
		});
	};

	const completeMessage = () => {
		setMessages((prev) =>
			prev.map((msg) =>
				msg.isStreaming ? { ...msg, isStreaming: false } : msg,
			),
		);
	};

	const streamChatResponse = async (prompt: string) => {
		try {
			const responseStream = await chatApis.chat({ prompt });

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
						// console.error("Error parsing line:", line, error);
						return error;
					}
				}
			}
		} catch (error) {
			addBotMessage(
				"Oops! Something went wrong while streaming the response.",
			);
			return error;
		}
	};

	const standards = [
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

	const reports = [
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

	const foldersList = [
		{
			id: "1",
			name: "Create New Folder",
			type: "folder",
		},
		{
			id: "2",
			name: "Folder 1",
			type: "folder",
		},
		{
			id: "3",
			name: "Folder 2",
			type: "folder",
		},
	];

	return (
		<div className="flex flex-col space-y-6 p-4 w-full h-full md:h-[90vh] rounded-lg shadow-lg bg-muted/50">
			{messages.length === 0 ? (
				<>
					<div className="flex flex-col items-center justify-center w-full h-full">
						<motion.div
							className="w-full max-w-[300px] aspect-w-1 aspect-h-1"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5 }}
						>
							<img
								src={MiraAvatar}
								alt="Avatar"
								className="w-full h-full object-cover"
							/>
						</motion.div>

						<h2 className="mt-4 text-2xl font-bold">
							Need a Security Check up?
						</h2>
					</div>
				</>
			) : (
				<ScrollArea
					ref={scrollAreaRef}
					className="flex-1 p-4 bg-gray-50 w-full"
				>
					<AnimatePresence>
						{messages.map((message) => (
							<motion.div
								key={message.id}
								initial={{ opacity: 0, y: 50 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -50 }}
								transition={{ duration: 0.3 }}
								className={`mb-4 ${
									message.sender === "user"
										? "text-right"
										: "text-left"
								}`}
							>
								<span
									className={`inline-block p-2 rounded-lg ${
										message.sender === "user"
											? "bg-black text-white"
											: "bg-gray-200 text-black"
									}`}
								>
									{message.sender === "user" ? (
										message.text
									) : (
										<ReactMarkdown>
											{message.text}
										</ReactMarkdown>
									)}
								</span>

								{pendingAction === message.id &&
									message.sender === "bot" &&
									(message.actionType === "scan" ||
									message.actionType === "report" ||
									message.actionType === "folder" ? (
										<VulnerabilityStandards
											question={
												message.humanInTheLoopMessage
											}
											actionPrompts={
												message.actionPrompts || []
											}
											onConfirm={confirmAction}
										/>
									) : (
										message.actionType === "approval" && (
											<HumanInTheLoop
												// message={
												// 	message.humanInTheLoopMessage
												// }
												onCancel={cancelAction}
												confirmType={
													message.confirmType
												}
												onConfirm={yesClicked}
											/>
										)
									))}
							</motion.div>
						))}
					</AnimatePresence>
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
			{/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 w-full xl:w-4/5 2xl:w-3/4 mx-auto">
				{actionCards.map((card, index) => (
					<motion.div
						key={card.title}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card
							className="cursor-pointer transition-colors hover:bg-gray-200 h-full p-4"
							onClick={() => handleCardClick(card.title, card.prompt)}
						>
							<CardContent className="flex flex-col space-y-2 items-center justify-center">
								<h2 className="text-lg font-semibold">{card.title}</h2>
								<img src={card.icon} alt={card.title} className="w-8 h-8" />
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div> */}

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
					// disabled={isLoading}
				/>
				<ChatActions
					handleSend={streamChatResponse}
					disabled={isLoading}
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
