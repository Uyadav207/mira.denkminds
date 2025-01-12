import { Button } from "../ui/button";

interface HumanInTheLoopProps {
	onConfirm: (confirmType: string) => void;
	onCancel: () => void;
	message?: string;
	confirmType: string;
}

const HumanInTheLoopApproval: React.FC<HumanInTheLoopProps> = ({
	onConfirm,
	onCancel,
	message,
	confirmType,
}) => {
	return (
		<div className="flex flex-col mt-4 p-4 bg-[#eeedff] border-l-4 border-[#7156DB] mb-4 rounded-lg rounded-l-none">
			<p className="flex items-center justify-start">{message}</p>
			<div className="flex space-x-4">
				<Button
					variant="secondary"
					size="lg"
					className="border"
					onClick={() => {
						onConfirm(confirmType);
					}}
				>
					Yes
				</Button>
				<Button
					size="lg"
					variant="destructive"
					type="button"
					onClick={onCancel}
				>
					No
				</Button>
			</div>
		</div>
	);
};

export { HumanInTheLoopApproval };
