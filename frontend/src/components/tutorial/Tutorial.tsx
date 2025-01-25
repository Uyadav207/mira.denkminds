import type React from "react";
import { useState, useEffect } from "react";
import Joyride, { type Step } from "react-joyride";
// import { Button } from "../ui/button";

interface TutorialProps {
	run: boolean;
	onExit: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ run, onExit }) => {
	// const [isRunning, setIsRunning] = useState(false);
	const [steps] = useState<Step[]>([
		{
			target: ".sidebar-section",
			content:
				"The sidebar provides quick access to the Dashboard,Scans,FAQ's and Reports sections. Use this to navigate through the application's main features.",
		},

		{
			target: ".chat-history-section",
			content:
				"This section displays a chronological history of all your recent conversations, with the newest chats appearing at the top.",
		},
		{
			target: ".dashboard-section",
			content:
				"The dashboard gives you an overview of your recent scanned websites with static and dynamic scanning and key insights from completed scans.",
		},
		{
			target: ".chat-input",
			content:
				"Here, you can type your questions or commands to interact with the chatbot. You can also initiate a website scan directly by entering the URL.",
		},
		{
			target: ".reports-section",
			content:
				"The reports section provides detailed analyses and summaries of your scanned websites and chat summaries, including performance metrics and security insights.",
		},
	]);

	useEffect(() => {
		// Check if all target elements exist in the DOM
		const checkTargetsExist = () => {
			return steps.every(
				(step) =>
					typeof step.target === "string" &&
					document.querySelector(step.target),
			);
		};

		// Wait until all target elements exist before running the tutorial
		const interval = setInterval(() => {
			if (checkTargetsExist()) {
				clearInterval(interval);
				// setRun(false);
			}
		}, 100); // Check every 100ms

		return () => clearInterval(interval);
	}, [steps]);

	return (
		<div>
			{/* <button className="tutorial-button" onClick={() => setRun(true)} >Start Tutorial</button> */}
			<Joyride
				steps={steps}
				run={run}
				continuous
				showSkipButton
				styles={{
					options: {
						zIndex: 10000,
					},
					buttonNext: {
						backgroundColor: "#272278",
					},
					buttonBack: {
						color: "#272278",
					},
				}}
				callback={(data) => {
					const { status } = data;
					if (status === "finished" || status === "skipped") {
						onExit();
					}
				}}
			/>
		</div>
	);
};

export default Tutorial;
