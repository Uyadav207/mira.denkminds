import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

export function NewChat() {
	const navigate = useNavigate();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					tooltip="New Chat"
					className="flex bg-secondary justify-center border border-sidebar"
					onClick={() => navigate("/chatbot")}
				>
					<Plus />
					<span>New Chat</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
