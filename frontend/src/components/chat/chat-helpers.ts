import type { Info, Message } from "../../types/chats";
import type { FolderItem } from "../../types/reports";
import { REPORTS, SCANTYPES, STANDARDS } from "./constants";

const requestHumanApproval = (
	action: string,
	manualMessage: string,
	type: string,
	id: string,
	foldersList: FolderItem[], //convex
	setHumanInTheLoopMessage: React.Dispatch<React.SetStateAction<string | null>>,
	setInfo: (info: Info[]) => void,
	setActionPrompts: React.Dispatch<
		React.SetStateAction<
			| []
			| {
					id: string;
					name: string;
					type: string;
			  }[]
		>
	>,
	setActionType: React.Dispatch<React.SetStateAction<string | null>>,
	setConfirmType: React.Dispatch<React.SetStateAction<string | null>>,
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
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
		approvalMessage = manualMessage;
		setActionPrompts([]);
		setHumanInTheLoopMessage(approvalMessage);
	} else if (action === "folder") {
		approvalMessage = "Select the folder where you want to save the report.";
		setActionPrompts(foldersList);
		setHumanInTheLoopMessage(approvalMessage);
	}
	const approvalMessageObject: Message = {
		id: id,
		message: manualMessage,
		sender: "ai",
		actionType: action,
		confirmType: type,
		humanInTheLoopMessage: approvalMessage,
	};
	setActionType(action);
	setConfirmType(type || null);
	setMessages((prev) => [...prev, approvalMessageObject]);
};

export { generateTitle, requestHumanApproval };
