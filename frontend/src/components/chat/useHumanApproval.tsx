import { useCallback } from "react";
import type { Info, Message } from "../../types/chats";
import type { FolderItem } from "../../types/reports";
import { REPORTS, SCANTYPES, STANDARDS } from "./constants";

interface UseHumanApprovalState {
	humanInTheLoopMessage: string | null;
	info: Info[];
	actionPrompts: { id: string; name: string; type: string }[];
	actionType: string | null;
	confirmType: string | null;
	messages: Message[];
}

interface UseHumanApprovalActions {
	setHumanInTheLoopMessage: (message: string | null) => void;
	setInfo: (info: Info[]) => void;
	setActionPrompts: React.Dispatch<
		React.SetStateAction<{ id: string; name: string; type: string }[]>
	>;
	setActionType: React.Dispatch<React.SetStateAction<string | null>>;
	setConfirmType: React.Dispatch<React.SetStateAction<string | null>>;
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

interface UseHumanApprovalReturn {
	requestApproval: (
		action: string,
		manualMessage: string,
		type: string,
		id: string,
		foldersList: FolderItem[],
	) => void;
}

export const useHumanApproval = (
	actions: UseHumanApprovalActions,
): UseHumanApprovalReturn => {
	const {
		setHumanInTheLoopMessage,
		setInfo,
		setActionPrompts,
		setActionType,
		setConfirmType,
		setMessages,
	} = actions;

	const requestApproval = useCallback(
		(
			action: string,
			manualMessage: string,
			type: string,
			id: string,
			foldersList: FolderItem[],
		) => {
			let approvalMessage = "";

			// Map action types to their corresponding handlers
			const actionHandlers: Record<string, () => void> = {
				scan: () => {
					approvalMessage =
						"Select your preferred scan type. You can choose from the following:";
					setActionPrompts(SCANTYPES);
					setHumanInTheLoopMessage(approvalMessage);
				},
				standards: () => {
					approvalMessage =
						"Select your preferred standard for the scan. You can choose from the following:";
					setActionPrompts(STANDARDS);
					setInfo(STANDARDS);
					setHumanInTheLoopMessage(approvalMessage);
				},
				report: () => {
					approvalMessage = "What type of report do you want to generate?";
					setActionPrompts(REPORTS);
					setHumanInTheLoopMessage(approvalMessage);
				},
				approval: () => {
					approvalMessage = manualMessage;
					setActionPrompts([]);
					setHumanInTheLoopMessage(approvalMessage);
				},
				save: () => {
					approvalMessage = "Select a folder to save the report.";
					setActionPrompts(foldersList);
					setHumanInTheLoopMessage(approvalMessage);
				},
			};

			const handler = actionHandlers[action];
			if (handler) {
				handler();
			} else {
				console.warn(`Unknown action type: ${action}`);
				return;
			}

			const approvalMessageObject: Message = {
				id,
				message: manualMessage,
				sender: "ai",
				actionType: type,
				confirmType: action,
				humanInTheLoopMessage: approvalMessage,
			};

			setActionType(action);
			setConfirmType(type || null);
			setMessages((prev) => [...prev, approvalMessageObject]);
		},
		[
			setHumanInTheLoopMessage,
			setInfo,
			setActionPrompts,
			setActionType,
			setConfirmType,
			setMessages,
		],
	);

	return { requestApproval };
};
