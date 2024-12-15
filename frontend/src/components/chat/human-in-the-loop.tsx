import { Button } from "../ui/button";

interface HumanInTheLoopProps {
	handleConfirm: () => void;
	handleCancel: () => void;
	message: string;
}

const HumanInTheLoop: React.FC<HumanInTheLoopProps> = ({
	handleConfirm,
	handleCancel,
	message,
}) => {
	return (
		<div className="flex flex-col mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-primary">
			<p className="mb-4 font-semibold">{message}</p>
			<div className="flex space-x-4">
				<Button
					variant="secondary"
					size="lg"
					className="border"
					onClick={handleConfirm}
				>
					Yes
				</Button>
				<Button
					size="lg"
					variant="destructive"
					type="button"
					onClick={handleCancel}
				>
					No
				</Button>
			</div>
		</div>
	);
};

export { HumanInTheLoop };
