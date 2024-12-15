import { Plus } from "lucide-react";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "../ui/sidebar";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export function TeamSwitcher() {
	const { state } = useSidebar();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					{state === "expanded" ? (
						<Link to="/chatbot">
							<Button size="lg" className="w-full justify-start">
								<Plus className="mr-2 h-4 w-4" />
								New Chat
							</Button>
						</Link>
					) : (
						<Button
							size="icon"
							variant="default"
							className="h-9 w-9"
						>
							<Plus className="h-4 w-4" />
							<span className="sr-only">New Chat</span>
						</Button>
					)}
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
