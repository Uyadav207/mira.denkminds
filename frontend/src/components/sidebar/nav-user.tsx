import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "../../components/ui/avatar";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "../../components/ui/sidebar";

import type { User } from "../../types/user";
import useStore from "../../store/store";
import { Dialog } from "../dialog";
import { useState } from "react";

export function NavUser() {
	const { isMobile } = useSidebar();
	const userData = useStore();
	const logout = useStore((state) => state.logout);
	const user: User = userData.user as User;
	const [isDialogOpen, setDialogOpen] = useState(false);

	const handleLogout = () => {
		logout();
		window.location.href = "/login";
	};

	const fullName: string = user?.firstName.concat(" ", user?.lastName);

	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage
										src={user?.avatar ?? undefined}
										alt={fullName}
									/>
									<AvatarFallback className="rounded-lg">
										{fullName.substring(0, 1)}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{fullName}
									</span>
									<span className="truncate text-xs">
										{user?.username}
									</span>
								</div>
								<ChevronsUpDown className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
							side={isMobile ? "bottom" : "right"}
							align="end"
							sideOffset={4}
						>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											src={user?.avatar ?? undefined}
											alt={fullName}
										/>
										<AvatarFallback className="rounded-lg">
											{/* {fullName.substring(0, 1)} */}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">
											{fullName}
										</span>
										<span className="truncate text-xs">
											{user?.email}
										</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem>
									<BadgeCheck />
									Account
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => setDialogOpen(true)}
							>
								<LogOut />
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
			<Dialog
				open={isDialogOpen}
				onClose={() => setDialogOpen(false)}
				title="Log out"
				description="Are you sure you want to log out? You will need to sign in again to access your account."
				onConfirm={handleLogout}
				onCancel={() => setDialogOpen(false)}
				confirmText="Log out"
				cancelText="Cancel"
			/>
		</>
	);
}
