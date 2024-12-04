export interface ChatSession {
	id: string;
	title: string;
	date: Date;
	messages: Message[];
}

export interface Message {
	id: string;
	text: string;
	sender: "user" | "bot";
	timestamp: Date;
}

// Mock data for chat sessions
export const mockChatSessions: ChatSession[] = [
	{
		id: "1",
		title: "Chat about AI",
		date: new Date("2023-12-01"),
		messages: [
			{
				id: "1",
				text: "What is AI?",
				sender: "user",
				timestamp: new Date("2023-12-01T10:00:00"),
			},
			{
				id: "2",
				text: "AI stands for Artificial Intelligence...",
				sender: "bot",
				timestamp: new Date("2023-12-01T10:01:00"),
			},
		],
	},
	{
		id: "2",
		title: "Machine Learning Discussion",
		date: new Date("2023-11-30"),
		messages: [
			{
				id: "1",
				text: "Can you explain machine learning?",
				sender: "user",
				timestamp: new Date("2023-11-30T15:00:00"),
			},
			{
				id: "2",
				text: "Machine learning is a subset of AI...",
				sender: "bot",
				timestamp: new Date("2023-11-30T15:01:00"),
			},
		],
	},
	// Add more mock sessions as needed
];
