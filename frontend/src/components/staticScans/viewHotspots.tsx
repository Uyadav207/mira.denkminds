import { useState } from "react";
import { Badge } from "../ui/badge";
import response from "../../response-sast.json";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Info, CheckCircle } from "lucide-react";
import { showSuccessToast } from "../toaster";

const ViewHotspots: React.FC = () => {
	const hotspots = response.report.hotspots || [];
	const [reviewedHotspots, setReviewedHotspots] = useState<string[]>([]);

	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 6;
	const totalPages = Math.ceil(hotspots.length / itemsPerPage);

	const currentData = hotspots.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const handlePreviousPage = () => {
		if (currentPage > 1) setCurrentPage((prev) => prev - 1);
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
	};

	const getBadgeColor = (probability: string) => {
		switch (probability.toUpperCase()) {
			case "HIGH":
				return "bg-red-100 text-red-600";
			case "MEDIUM":
				return "bg-yellow-100 text-yellow-600";
			case "LOW":
				return "bg-blue-100 text-blue-600";
			default:
				return "bg-gray-100 text-gray-600";
		}
	};

	const handleReviewClick = (key: string) => {
		setReviewedHotspots((prev) =>
			prev.includes(key) ? prev : [...prev, key],
		);
		if (!reviewedHotspots.includes(key)) {
			setReviewedHotspots((prev) => [...prev, key]);
			showSuccessToast("Hotspot successfully reviewed!");
		}
	};

	return (
		<div className="p-6">
			<div className="flex items-center mb-2 space-x-2">
				<h1 className="text-2xl font-bold">Security Hotspots</h1>

				<Tooltip>
					<TooltipTrigger>
						<Info className="w-5 h-5 text-gray-500 cursor-pointer" />
					</TooltipTrigger>
					<TooltipContent>
						Security hotspots are areas in the code that may require
						a review to ensure security compliance.
					</TooltipContent>
				</Tooltip>
			</div>

			<div className="flex  items-center mb-6">
				<p className="font-bold text-red-700 mr-2">NOTE!</p>
				<p className="text-sm text-red-600 font-semibold">
					Hotspots are identified to bring into your focus but not
					necessarily real vulnerabilities. Please review them first
					and then take action.
				</p>
			</div>

			<div className="grid gap-4">
				{currentData.map((hotspot) => (
					<div
						key={hotspot.key}
						className="relative border rounded-md p-4 bg-sidebar"
					>
						<Badge
							className={`absolute top-4 right-4 ${getBadgeColor(
								hotspot.vulnerabilityProbability,
							)} font-semibold`}
						>
							{hotspot.vulnerabilityProbability}
						</Badge>

						<div className="flex items-center space-x-2 mb-2">
							<p className="text-lg font-semibold">
								{hotspot.message}
							</p>
							<Button
								className={`flex items-center space-x-1 ${
									reviewedHotspots.includes(hotspot.key)
										? "bg-gray-200 text-gray-800 hover:bg-gray-200"
										: "bg-blue-500 text-white hover:bg-blue-600"
								} px-2 py-1 text-xs rounded-md`}
								onClick={() => handleReviewClick(hotspot.key)}
							>
								<CheckCircle className="w-4 h-4" />
								<span>
									{reviewedHotspots.includes(hotspot.key)
										? "Reviewed"
										: "Review"}
								</span>
							</Button>
						</div>

						<div className="flex items-center justify-between mt-2 text-sm">
							<p className="text-gray-500">
								<span className="font-bold">Component:</span>{" "}
								{hotspot.component}
							</p>
							<p className="text-gray-500 font-semibold">
								Line: {hotspot.line}
							</p>
						</div>
					</div>
				))}
			</div>

			<div className="flex justify-center space-x-4 mt-6">
				<Button
					className="bg-secondary border border-secondary text-[#7156DB] hover:bg-sidebar w-1/6 shadow-none"
					onClick={handlePreviousPage}
					disabled={currentPage === 1}
				>
					Previous
				</Button>
				<Button
					className="bg-secondary border border-secondary text-[#7156DB] hover:bg-sidebar shadow-none w-1/6"
					onClick={handleNextPage}
					disabled={currentPage === totalPages}
				>
					Next
				</Button>
			</div>
		</div>
	);
};

export default ViewHotspots;
