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
				"Dashboard Secton Contains all the information about the Scanned Websites and Recent Scans.Scan Section shows all in detail information about the Scans done on the Websites.",
		},

		{
			target: ".chat-history-section",
			content:
				"Displayes all the recent chats from newst to oldest chats and conversations.",
		},
		{
			target: ".chat-input",
			content:
				"Type your Questions here and get the answers from the Chatbot.Also you can scan your website directly with MIRA.",
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
