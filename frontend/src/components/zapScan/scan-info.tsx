import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import copy from "../../assets/copy.svg";
import scanDetails from "./scan-details";

const ScanInfo: React.FC = () => {
	return (
		<div className="p-6 h-full w-full">
			<div className="space-y-4">
				{scanDetails.map((item) => (
					<div key={item.id}>
						<div className="flex justify-between items-center">
							<span className="text-sm font-medium mb-6">
								{item.label}
							</span>

							<div className="flex items-center w-3/4 gap-x-2">
								<span className="text-sm  mb-6 break-all">
									{item.value}
								</span>
								{/* Copy Icon */}
								{item.copyable && (
									<Button
										className="mb-6"
										variant="default"
										onClick={() =>
											navigator.clipboard.writeText(
												item.value,
											)
										}
										size="sm"
									>
										<img
											src={copy}
											alt="Copy to clipboard"
											className="w-4 h-4"
										/>
									</Button>
								)}
							</div>
						</div>

						<Separator className="mt-2" />
					</div>
				))}
			</div>
		</div>
	);
};

export default ScanInfo;
