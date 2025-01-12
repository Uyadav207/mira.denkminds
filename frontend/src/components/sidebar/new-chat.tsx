import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import useChatActionStore from "../../store/chatActions";

export function NewChat() {
	const navigate = useNavigate();
	const {
		setCreatedChatId,
		setMessages,
		setPendingAction,
		setFetchChatsRegurlarly,
		setTargetUrl,
	} = useChatActionStore();

	const handleNewChat = () => {
		setCreatedChatId(null);
		setMessages([]);
		setPendingAction(null);
		setTargetUrl("");
		setFetchChatsRegurlarly(false);

		navigate("/chatbot");
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					tooltip="New Chat"
					className="flex bg-secondary justify-center cursor-pointer"
					onClick={handleNewChat}
				>
					<Plus />
					<span>New Chat</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
