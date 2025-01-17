import { Button } from "../ui/button";
import { BadgeInfo } from "lucide-react";
import { ScrollArea, ScrollBar } from "@components/ui/scroll-area";

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
		<div className="flex flex-col mt-4 p-4 bg-[#eeedff] border-l-4 border-[#7156DB] mb-4 rounded-lg rounded-l-none">
			<div className="flex items-center justify-start">
				<p className="text-gray-950 mr-2">{question}</p>

				<BadgeInfo
					onClick={() => setShowInfo(true)}
					className="h-4 w-4 cursor-pointer text-black"
				/>
			</div>

			<ScrollArea className="w-[90%]">
				<div className="flex space-x-4  py-4">
					{actionPrompts.map((action) => (
						<Button
							key={action.id}
							variant="secondary"
							size="sm"
							onClick={() => onConfirm(action.name, action.type, action.id)}
							className="bg-[#7156DB] text-white hover:bg-[#5c4baf]"
						>
							{action.name}
						</Button>
					))}
				</div>
				<ScrollBar orientation="horizontal" className=" " />
			</ScrollArea>
		</div>
	);
};

export { HumanInTheLoopOptions };
