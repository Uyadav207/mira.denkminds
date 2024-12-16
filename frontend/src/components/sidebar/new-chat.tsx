import { Plus } from "lucide-react";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "../ui/sidebar";
import { Button } from "../ui/button";

export function TeamSwitcher() {
	const { state } = useSidebar();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				{state === "expanded" ? (
					<Button size="lg" className="w-full justify-start">
						<Plus className="mr-2 h-4 w-4" />
						New Chat
					</Button>
				) : (
					<Button size="icon" variant="default" className="h-9 w-9">
						<Plus className="h-4 w-4" />
						<span className="sr-only">New Chat</span>
					</Button>
				)}
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
