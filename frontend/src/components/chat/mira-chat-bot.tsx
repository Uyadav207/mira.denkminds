import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

import { ChatActions } from "@components/chat/chat-actions";
import { Textarea } from "@components/ui/textarea";
import { ScrollArea } from "@components/ui/scroll-area";
import { Card, CardContent } from "@components/ui/card";
import { Spinner } from "@components/loader/spinner";

// svg
import MiraLogo from "../../assets/MiraLogo.svg";
import MiraAvatar from "../../assets/Mira.svg";
import GetStarted from "../../assets/GetStarted.svg";
import SummaryIcon from "../../assets/SummaryIcon.svg";
import AnalyseIcon from "../../assets/AnalyseIcon.svg";

// types
import type { Message } from "../../types/message";
// import { HumanInTheLoop } from "./human-in-the-loop";
import toast from "react-hot-toast";

const MiraChatBot: React.FC = () => {
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	// const [showConfirmation, setShowConfirmation] = useState(false);
	// const [pendingPrompt, setPendingPrompt] = useState("");

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

	const actionCards = [
		{
			title: "Get Started",
			prompt: "Hi How can I help you today?",
			icon: GetStarted,
		},
		{
			title: "Scan Website",
			prompt: "Please enter the URL for analysis.",
			icon: AnalyseIcon,
		},
		{
			title: "Report Generation",
			prompt: "Please select the report type.",
			icon: SummaryIcon,
		},
	];

	const handleCardClick = (prompt: string) => {
		const newMessage: Message = {
			id: Date.now(),
			text: prompt,
			sender: "bot",
		};
		setMessages([...messages, newMessage]);
		setInput("");

		// if (prompt.toLowerCase().includes("report")) {
		// 	response +=
		// 		" It seems you're interested in reports. Here are some suggested actions.";
		// 	suggestedActions = [
		// 		{
		// 			title: "Generate Report",
		// 			prompt: "Can you generate a detailed report for me?",
		// 		},
		// 		{
		// 			title: "Analyze Data",
		// 			prompt: "I need help analyzing the data in my report.",
		// 		},
		// 		{
		// 			title: "Summarize Report",
		// 			prompt: "Can you summarize the key points of my report?",
		// 		},
		// 	];
		// } else if (prompt.toLowerCase().toLowerCase().includes("data")) {
		// 	response +=
		// 		" It looks like you're working with data. Here are some data-related actions.";
		// 	suggestedActions = [
		// 		{
		// 			title: "Data Visualization",
		// 			prompt: "Can you help me visualize this data?",
		// 		},
		// 		{
		// 			title: "Data Cleaning",
		// 			prompt: "I need assistance in cleaning my dataset.",
		// 		},
		// 		{
		// 			title: "Statistical Analysis",
		// 			prompt: "Can you perform a statistical analysis on this data?",
		// 		},
		// 	];
		// } else {
		// 	response += " Here are some general actions you might find helpful.";
		// 	suggestedActions = [
		// 		{ title: "Ask Question", prompt: "I have a question about..." },
		// 		{ title: "Get Help", prompt: "I need help with..." },
		// 		{
		// 			title: "Explore Features",
		// 			prompt: "What features does this application have?",
		// 		},
		// 	];
		// }
		// handleUserResponse(prompt);
	};
	// const handleConfirm = async (confirmed: boolean) => {
	// 	if (confirmed && pendingPrompt) {
	// 		try {
	// 			setIsLoading(true); // Start loading

	// 			const botMessage: Message = {
	// 				id: Date.now(),
	// 				text: "Processing your confirmed request...",
	// 				sender: "bot",
	// 				humanInTheLoop: true,
	// 			};
	// 			setMessages((prevMessages) => [...prevMessages, botMessage]);
	// 		} catch (error) {
	// 			// console.error("Error processing confirmation:", error);
	// 			if (error instanceof Error) {
	// 				toast.error(error.message);
	// 			} else {
	// 				toast.error("An unknown error occurred.");
	// 			}
	// 		} finally {
	// 			setIsLoading(false); // Stop loading
	// 			setPendingPrompt("");
	// 			// setShowConfirmation(false);
	// 		}
	// 	} else {
	// 		setPendingPrompt("");
	// 		// setShowConfirmation(false);
	// 	}
	// };

	// const handleCancel = () => {
	// 	setShowConfirmation(false);
	// 	setPendingPrompt("");
	// };
	const handleBotResponse = async (prompt: string) => {
		// Proceed with the action if no confirmation is needed
		processPrompt(prompt);
	};

	const processPrompt = async (prompt: string) => {
		const urlPattern = /(https?:\/\/[^\s]+)/g;
		const scanKeywords = ["scan", "scan operation"];

		if (
			urlPattern.test(prompt) ||
			scanKeywords.some((keyword) => prompt.includes(keyword))
		) {
			// Ask for confirmation
			// setPendingPrompt(prompt);
			// setShowConfirmation(true);
			// return;
			try {
				setIsLoading(true); // Start loading

				const botMessage: Message = {
					id: Date.now(),
					text: "Should Mira proceed with the request?",
					sender: "bot",
					humanInTheLoop: true,
				};
				setMessages((prevMessages) => [...prevMessages, botMessage]);
			} catch (error) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("An unknown error occurred.");
				}
			} finally {
				setIsLoading(false); // Stop loading
			}
		} else {
			try {
				setIsLoading(true); // Start loading

				const botMessage: Message = {
					id: Date.now(),
					text: `User said: ${prompt}`,
					sender: "bot",
					humanInTheLoop: false,
				};
				setMessages((prevMessages) => [...prevMessages, botMessage]);
			} catch (error) {
				if (error instanceof Error) {
					toast.error(error.message);
				} else {
					toast.error("An unknown error occurred.");
				}
			} finally {
				setIsLoading(false); // Stop loading
			}
		}
	};

	const handleSend = async () => {
		if (input.trim()) {
			const newMessage: Message = {
				id: Date.now(),
				text: input,
				sender: "user",
			};
			setMessages([...messages, newMessage]);
			setInput("");
			await handleBotResponse(input);
		}
	};

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
										<>
											<ReactMarkdown>
												{message.text}
											</ReactMarkdown>
										</>
									)}
								</span>
								{/* {message.humanInTheLoop &&
									message.sender === "bot" &&
									showConfirmation && (
										<HumanInTheLoop
											handleCancel={handleCancel}
											handleConfirm={handleConfirm}
											message="Are you sure you want to proceed?"
										/>
									)} */}
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
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 w-full xl:w-4/5 2xl:w-3/4 mx-auto">
				{actionCards.map((card, index) => (
					<motion.div
						key={card.title}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card
							className="cursor-pointer transition-colors hover:bg-gray-200 h-full p-4"
							onClick={() => handleCardClick(card.prompt)}
						>
							<CardContent className="flex flex-col space-y-2 items-center justify-center">
								<h2 className="text-lg font-semibold">
									{card.title}
								</h2>
								<img
									src={card.icon}
									alt={card.title}
									className="w-8 h-8"
								/>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>

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
					disabled={isLoading}
				/>
				<ChatActions handleSend={handleSend} disabled={isLoading} />
			</div>
		</div>
	);
};

export default MiraChatBot;
