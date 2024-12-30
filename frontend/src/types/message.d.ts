export interface Message {
	id: string;
	text: string;
	actionPrompts?: { id: string; name: string; type: sting }[];
	sender: "user" | "bot";
	humanInTheLoop?: boolean;
	humanInTheLoopMessage?: string;
	actionType?: string;
	confirmType?: string;
	isStreaming?: boolean;
}
