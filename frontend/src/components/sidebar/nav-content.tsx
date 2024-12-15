import {
	Folder,
	Home,
	MessageCircle,
	MoreHorizontal,
	Settings2,
	Trash2,
	Share2,
	Copy,
} from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarSeparator,
	SidebarContent,
	SidebarGroupContent,
} from "../../components/ui/sidebar";
import { Button } from "../../components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { SidebarMenuBadge } from "../ui/sidebar";
import { useNavigate } from "react-router-dom";

interface Chat {
	id: string;
	title: string;
	url: string;
}

const recentChats: Chat[] = [
	{ id: "1", title: "What is this app about?", url: "#" },
	{ id: "2", title: "What AI is doing?", url: "#" },
	{ id: "3", title: "Find out best solution using AI?", url: "#" },
	{ id: "4", title: "How to use the app effectively?", url: "#" },
	{ id: "5", title: "Troubleshooting common issues", url: "#" },
	{ id: "6", title: "Advanced AI techniques", url: "#" },
	{ id: "7", title: "Customizing AI responses", url: "#" },
];

export default function NavContent() {
	const navigate = useNavigate();

	return (
		<>
			<SidebarGroup>
				<SidebarMenu>
					<SidebarMenuItem>
						{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
						<a onClick={() => navigate("/dashboard")}>
							<SidebarMenuButton tooltip="Home">
								<Home className="h-4 w-4" />
								<span>Dashboard</span>
							</SidebarMenuButton>
						</a>
					</SidebarMenuItem>
					<SidebarMenuItem>
						{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
						<a onClick={() => navigate("/settings")}>
							<SidebarMenuButton tooltip="Settings">
								<Settings2 className="h-4 w-4" />
								<span>Settings</span>
							</SidebarMenuButton>
						</a>
					</SidebarMenuItem>
					<SidebarMenuItem>
						{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
						<a onClick={() => navigate("/reports")}>
							<SidebarMenuButton tooltip="Reports">
								<Folder className="h-4 w-4" />
								<span>Reports</span>
							</SidebarMenuButton>

							{/* Calculate Length of the no of reports array */}
							<SidebarMenuBadge>12</SidebarMenuBadge>
						</a>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>
			<SidebarSeparator />
			<SidebarGroup>
				<SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
				<SidebarContent className="h-[calc(100vh-280px)]">
					<SidebarGroupContent>
						<SidebarMenu>
							{recentChats.map((chat) => (
								<SidebarMenuItem key={chat.id}>
									<SidebarMenuButton
										asChild
										className="w-full justify-between"
									>
										<a
											href={chat.url}
											className="flex items-center"
										>
											<MessageCircle className="mr-2 h-4 w-4 shrink-0" />
											<span className="flex-grow truncate">
												{chat.title}
											</span>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														className="ml-auto h-8 w-8 p-0"
													>
														<MoreHorizontal className="h-4 w-4 ml-auto" />
														<span className="sr-only">
															Open menu
														</span>
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													align="end"
													className="w-[160px]"
												>
													<DropdownMenuItem
													// onClick={() =>
													// 	handleCopy(chat.id)
													// }
													>
														<Copy className="mr-2 h-4 w-4" />
														<span>Copy</span>
													</DropdownMenuItem>
													<DropdownMenuItem
													// onClick={() =>
													// 	handleShare(chat.id)
													// }
													>
														<Share2 className="mr-2 h-4 w-4" />
														<span>Share</span>
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														// onClick={() => handleDelete(chat.id)}
														className="text-red-600"
													>
														<Trash2 className="mr-2 h-4 w-4" />
														<span>Delete</span>
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarContent>
			</SidebarGroup>
		</>
	);
}
