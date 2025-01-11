import { Button } from "../ui/button";
import { Info } from "lucide-react";

interface VulnerabilityStandardsProps {
	question?: string;
	actionPrompts: { id: string; name: string; type: string }[];
	onConfirm: (selectedAction: string, type: string, actionId: string) => void;
	setShowInfo: (value: boolean) => void;
}

const HumanInTheLoopOptions: React.FC<VulnerabilityStandardsProps> = ({
	question,
	actionPrompts,
	onConfirm,
	setShowInfo,
}) => {
	return (
		<div className="flex flex-col mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-primary">
			<div className="flex items-center justify-start">
				<p className=" font-semibold">{question}</p>
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6"
					onClick={() => setShowInfo(true)}
				>
					<Info className="h-4 w-4" />
				</Button>
			</div>

			<div className="flex space-x-4 mt-2">
				{actionPrompts.map((action) => (
					<Button
						key={action.id}
						variant="secondary"
						size="lg"
						className="border"
						onClick={() =>
							onConfirm(action.name, action.type, action.id)
						}
					>
						{action.name}
					</Button>
				))}
			</div>
		</div>
	);
};

export { HumanInTheLoopOptions };
