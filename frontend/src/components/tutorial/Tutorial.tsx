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
			target: ".dashboard-button",
			content:
				"Dashboard Secton Contains all the information about the Scanned Websites and Recent Scans.",
		},

		{
			target: ".scans-button",
			content:
				"Scan Section shows all in detail information about the Scans done on the Websites.",
		},
		{
			target: ".chat-input",
			content:
				"Type your Questions here and get the answers from the Chatbot.Also you can scan your website directly with MIRA.",
		},
		{
			target: ".accounts-button",
			content: "Click here to change your settings like Update Profile data.",
		},
		{
			target: ".reports-button",
			content:
				"Save the Reports and Chat Summaries in PDF format and Access them later.",
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
