export interface Chats {
	_id: string;
	title: string;
}

export interface ChatHistory {
	_id: string;
	humanInTheLoopId: string;
	chatId: string;
	message: string;
	sender: string;
	createdAt: string;
}

export interface Message {
	id?: string;
	humanInTheLoopId?: string;
	chatId?: string;
	hitId?: string;
	message: string;
	actionPrompts?: { id: string; name: string; type: sting }[];
	sender: "user" | "ai";
	humanInTheLoopMessage?: string;
	actionType?: string;
	confirmType?: string;
	isStreaming?: boolean;
}
