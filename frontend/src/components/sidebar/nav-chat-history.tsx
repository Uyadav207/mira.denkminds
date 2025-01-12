import { useState, useEffect } from "react";

import { ChevronRight, MessageSquareCode, User2 } from "lucide-react";
import {
	Folder,
	Home,
	MessageCircle,
	MoreHorizontal,
	Trash2,
	ScanText,
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
} from "@components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { SidebarMenuBadge } from "@components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import useStore from "../../store/store";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Chats } from "../../types/chats";
import { SidebarMenuSub, useSidebar } from "../ui/sidebar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "../ui/collapsible";
import { showSuccessToast } from "../toaster";

const ChatSkeleton = () => {
	return (
		<div className="animate-pulse">
			{[...Array(5)].map((_, i) => {
				const key = `skeleton-${i}`;
				return (
					<div key={key} className="flex items-center space-x-4 p-2">
						<div className="h-5 w-5 rounded-full bg-secondary " />
						<div className="h-5 w-3/4 rounded bg-secondary" />
					</div>
				);
			})}
		</div>
	);
};

export default function ChatHistory() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const { state } = useSidebar();
	const user = useStore((state) => state.user);
	if (!user) {
		return null;
	}
	const { id } = user;

	const recentChats = useQuery(api.chats.getChatsByUserId, {
		userId: String(id),
	});

	const deleteChatById = useMutation(api.chats.deleteChatById);

	const handleDelete = async (chatId: string) => {
		try {
			const result = await deleteChatById({ chatId });
			showSuccessToast(result.message);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`An error occurred: ${error.message}`);
			}
		}
	};

	useEffect(() => {
		if (recentChats) {
			setIsLoading(false);
		}
	}, [recentChats]);

	return (
		<>
			<SidebarGroup>
				<SidebarMenu>
					<Collapsible defaultOpen className="group/collapsible">
						<SidebarMenuItem>
							<CollapsibleTrigger asChild>
								<SidebarMenuButton tooltip="Dashboard">
									<Home className="h-4 w-4" />
									<span>Dashboard</span>
									<ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
								</SidebarMenuButton>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<SidebarMenuSub>
									{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
									<a onClick={() => navigate("/recent-scan")}>
										<SidebarMenuButton tooltip="Scans">
											<ScanText className="h-4 w-4" />
											<span>Scans</span>
										</SidebarMenuButton>
									</a>
								</SidebarMenuSub>
							</CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
					<SidebarMenuItem>
						{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
						<a onClick={() => navigate("/accounts")}>
							<SidebarMenuButton tooltip="Accounts">
								<User2 className="h-4 w-4" />
								<span>Accounts</span>
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
				{recentChats?.length > 0 && (
					<SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
				)}
				<SidebarContent className="h-[calc(100vh-280px)]">
					<SidebarGroupContent>
						<SidebarMenu>
							{isLoading ? (
								<ChatSkeleton />
							) : recentChats?.length === 0 ? (
								<SidebarMenuItem>
									<div className="mt-10 flex flex-col items-center justify-center">
										<MessageSquareCode />
										{state === "expanded" && (
											<p>No recent chats</p>
										)}
									</div>
								</SidebarMenuItem>
							) : (
								recentChats?.map((chat: Chats) => (
									<SidebarMenuItem key={chat._id}>
										<SidebarMenuButton
											asChild
											className="w-full justify-between cursor-pointer"
											onClick={() =>
												navigate(`/chatbot/${chat._id}`)
											}
										>
											<div className="flex items-center">
												<MessageCircle className="mr-2 h-4 w-4 shrink-0" />
												<span className="flex-grow truncate">
													{chat.title}
												</span>
												<DropdownMenu>
													<DropdownMenuTrigger
														asChild
													>
														<MoreHorizontal className="h-4 w-4 ml-auto right-0 cursor-pointer" />
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align="end"
														sideOffset={4}
														className="w-[160px] bg-white shadow-lg rounded-md border border-gray-200"
													>
														<DropdownMenuItem
															onClick={() =>
																handleDelete(
																	chat._id,
																)
															}
															className="text-red-600 flex items-center gap-2 hover:bg-red-50 cursor-pointer"
														>
															<Trash2 className="mr-2 h-4 w-4" />
															<span>Delete</span>
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarContent>
			</SidebarGroup>
		</>
	);
}
