import { HelpCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "../ui/sidebar";
import useChatActionStore from "../../store/chatActions";
import Tutorial from "../tutorial/tutorial";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export function NewChat() {
	const navigate = useNavigate();
	const { clearStore } = useChatActionStore();
	const { state } = useSidebar();
	const [runTutorial, setRunTutorial] = useState(false);

	// Check if the user is new or if they have seen the tutorial before
	useEffect(() => {
		const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
		if (!hasSeenTutorial) {
			// If the user hasn't seen the tutorial, show it automatically on the first login
			setRunTutorial(true);
		}
	}, []);

	// Handle the "Take a Tutorial" button click
	const handleTakeTutorial = () => {
		setRunTutorial(true);
	};

	// Handle tutorial exit (mark the tutorial as seen)
	const handleExitTutorial = () => {
		localStorage.setItem("hasSeenTutorial", "true"); // Store in localStorage that the user has seen the tutorial
		setRunTutorial(false); // Hide the tutorial after exit
	};

	const handleNewChat = () => {
		clearStore();
		navigate("/chatbot");
	};

	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem>
					{state === "expanded" ? (
						<Button
							onClick={handleTakeTutorial}
							size="lg"
							className="flex bg-secondary justify-center border border-sidebar w-full"
						>
							<HelpCircle className="mr-2 h-4 w-4" />
							Take a Tutorial
						</Button>
					) : (
						<Button
							onClick={handleTakeTutorial}
							size="icon"
							variant="default"
							className="flex bg-secondary justify-center border border-sidebar h-9 w-9"
						>
							<HelpCircle className="text-[#7156DB] h-4 w-4" />
							<span className="text-[#7156DB] sr-only">
								Take a Tutorial
							</span>
						</Button>
					)}
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuButton
						tooltip="New Chat"
						className="flex bg-secondary justify-center border border-sidebar"
						onClick={handleNewChat}
					>
						<Plus className="text-[#7156DB]" />
						<span className="text-[#7156DB]">New Chat</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
			<Tutorial run={runTutorial} onExit={handleExitTutorial} />
		</>
	);
}
