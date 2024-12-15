import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./new-chat";
import NavContent from "./nav-content";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarSeparator,
} from "../ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props} variant="floating">
			<SidebarHeader>
				<NavUser />
			</SidebarHeader>
			<SidebarSeparator />
			<SidebarContent>
				<NavContent />
			</SidebarContent>
			<SidebarFooter>
				<TeamSwitcher />
			</SidebarFooter>
		</Sidebar>
	);
}
