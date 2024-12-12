import { useState, useEffect, useRef } from "react";

import { Textarea } from "@components/ui/textarea";

import { Card, CardContent } from "@components/ui/card";

import MiraAvatar from "../../assets/Mira.svg";

import { ScrollArea } from "../ui/scroll-area";

import MiraLogo from "../../assets/MiraLogo.svg";
import SendIcon from "../../assets/SendIcon.svg";
import AttachIcon from "../../assets/AttachIcon.svg";

import { motion, AnimatePresence } from "framer-motion";

interface Message {
	id: number;
	text: string;
	sender: "user" | "bot";
}

const SecurityCheckComponent: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [selectedCard, setSelectedCard] = useState<string | null>(null);
	const scrollAreaRef = useRef<HTMLDivElement>(null);

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
			prompt: "How do I get started with this application?",
		},
		{
			title: "Report Analysis",
			prompt: "Can you analyze my latest report?",
		},
		{
			title: "Report Generation",
			prompt: "Generate a sample report for me.",
		},
	];

	const handleCardClick = (prompt: string) => {
		setSelectedCard(prompt);
		setInput(prompt);
	};

	const handleSend = () => {
		if (input.trim()) {
			const newMessage: Message = {
				id: Date.now(),
				text: input,
				sender: "user",
			};
			setMessages([...messages, newMessage]);
			setInput("");

			// Simulate bot response
			setTimeout(() => {
				const botMessage: Message = {
					id: Date.now(),
					text: `You said: "${input}"`,
					sender: "bot",
				};
				setMessages((prevMessages) => [...prevMessages, botMessage]);
			}, 1000);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-[#EFEFEF]">
			<div className="flex flex-col items-center justify-start space-y-6 p-4 w-3/4 h-[80vh] rounded-lg shadow-lg bg-background">
				{messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center w-full h-full">
						{/* Avatar */}
						<div className="w-[20%]">
							{/* Replace with your avatar */}
							<img
								src={MiraAvatar} // Replace with the avatar URL
								alt="Avatar"
								className="w-full h-full object-cover"
							/>
						</div>

						{/* Heading */}
						<h2 className="text-2xl font-bold">
							Need a Security Check up?
						</h2>
					</div>
				) : (
					<ScrollArea
						ref={scrollAreaRef}
						// className="flex-grow mb-4 p-4 bg-white rounded-lg shadow"
						className="flex-1 p-4 bg-gray-50 w-3/4"
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
										{message.text}
									</span>
								</motion.div>
							))}
						</AnimatePresence>
					</ScrollArea>
				)}
				{/* Buttons */}

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
					{actionCards.map((card, index) => (
						<motion.div
							key={card.title}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card
								className={`cursor-pointer transition-colors ${
									selectedCard === card.prompt
										? "bg-primary text-primary-foreground"
										: "hover:bg-gray-200"
								}`}
								onClick={() => handleCardClick(card.prompt)}
							>
								<CardContent className="flex flex-col items-center justify-center h-24">
									<h2 className="text-lg font-semibold">
										{card.title}
									</h2>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>

				<div className="flex items-center w-3/4 rounded-lg px-4 py-2 shadow-sm">
					{/* Icon on the left */}
					<img
						src={MiraLogo} // Replace with your icon URL
						alt="Logo"
						className="w-7 h-7 mr-2"
					/>
					<Textarea
						value={input}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
							setInput(e.target.value)
						}
						onKeyPress={(
							e: React.KeyboardEvent<HTMLTextAreaElement>,
						) => e.key === "Enter" && handleSend()}
						className="flex-1"
						placeholder="Type your prompt here or click on the action cards..."
					/>
					{/* Attachment icon */}
					<button
						type="button"
						className="p-2 hover:bg-gray-200 rounded-md"
					>
						<img
							src={AttachIcon} // Replace with your icon URL
							alt="Logo"
							className="w-5 h-5"
						/>
					</button>
					<button
						onClick={handleSend}
						type="button"
						className="p-2 hover:bg-gray-200 rounded-md"
					>
						<img
							src={SendIcon} // Replace with your icon URL
							alt="Logo"
							className="w-5 h-5"
						/>
					</button>
					{/* Send button */}
				</div>

				{/* Prompt Input */}
			</div>
		</div>
	);
};

export default SecurityCheckComponent;
