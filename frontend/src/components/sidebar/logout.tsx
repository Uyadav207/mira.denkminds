import { LogOut } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { Dialog } from "../dialog";
import useStore from "../../store/store";

import { useState } from "react";

export function Logout() {
	const logout = useStore((state) => state.logout);
	const [isDialogOpen, setDialogOpen] = useState(false);

	const handleLogout = () => {
		logout();
		window.location.href = "/login";
	};

	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						tooltip="Log out"
						className="flex bg-black text-white justify-center hover:bg-black hover:text-white dark:bg-white dark:text-black dark:hover:bg-white dark:hover:text-black"
						onClick={() => setDialogOpen(true)}
					>
						<LogOut />
						<span>Log out</span>
					</SidebarMenuButton>
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
