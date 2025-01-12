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
			<p className="text-gray-950 mr-2 mb-4">{message}</p>
			<div className="flex space-x-4">
				<Button
					size="lg"
					className="bg-[#7156DB] text-white hover:bg-[#5c4baf]"
					onClick={() => {
						onConfirm(confirmType);
					}}
				>
					Yes
				</Button>
				<Button
					size="lg"
					className="bg-red-500 text-white hover:bg-red-700"
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
