import { Plus } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export function TeamSwitcher() {
	const { state } = useSidebar();
	const navigate = useNavigate();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				{state === "expanded" ? (
					<Button size="lg" className="w-full justify-start" onClick={() => navigate("/chatbot")} >
						<Plus className="mr-2 h-4 w-4" />
						New Chat
					</Button>
				) : (
					<Button size="icon" variant="default" className="h-9 w-9" onClick={() => navigate("/chatbot")} >
						<Plus className="h-4 w-4" />
						<span className="sr-only">New Chat</span>
					</Button>
				)}
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
