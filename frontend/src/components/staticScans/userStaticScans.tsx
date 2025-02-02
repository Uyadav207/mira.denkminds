import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useNavigate } from "react-router-dom";
import response from "../../response-sast.json";
import { scanData } from "../../utils/sastScan";

const UserStaticScans: React.FC = () => {
	const navigate = useNavigate();

	const metrics = Object.entries(scanData.metrics);

	return (
		<Card className="rounded-lg border p-6 bg-sidebar shadow-md w-full max-w-6xl mx-auto">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
				<div className="flex items-center space-x-2">
					<h1 className="text-xl sm:text-2xl font-semibold ">
						{scanData.title}
					</h1>
					<Badge className="bg-gray-200 text-gray-600 text-xs sm:text-sm">
						{scanData.visibility}
					</Badge>
				</div>
				<Badge
					className={`${
						scanData.status === "Passed"
							? "bg-green-100 text-green-700"
							: "bg-red-100 text-red-600"
					} px-3 py-1`}
				>
					{scanData.status}
				</Badge>
			</div>

			{/* Metadata */}
			<div className="text-gray-500 text-xs sm:text-sm mb-4">
				Last analysis: {scanData.lastAnalysis}
			</div>

			{/* Metrics */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 text-sm">
				{metrics.slice(0, 4).map(([metric, data]) => (
					<div key={metric} className="flex items-center space-x-2 p-2 bg-white shadow-sm rounded-lg">
						<Badge
							className={`${
								data.level === "E"
									? "bg-red-100 text-red-600"
									: data.level === "D"
										? "bg-yellow-100 text-yellow-600"
										: "bg-green-100 text-green-600"
							} px-2`}
						>
							{data.level}
						</Badge>
						<div>
							<p className="font-semibold text-xs sm:text-sm ">{metric}</p>
							<p className="font-bold text-sm sm:text-base">{data.value}</p>
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 text-sm">
				{metrics.slice(4).map(([metric, data]) => (
					<div key={metric} className="flex items-center space-x-2 p-2 bg-white shadow-sm rounded-lg">
						<Badge
							className={`${
								data.level === "E"
									? "bg-red-100 text-red-600"
									: data.level === "D"
										? "bg-yellow-100 text-yellow-600"
										: "bg-green-100 text-green-600"
							} px-2`}
						>
							{data.level}
						</Badge>
						<div>
							<p className="font-semibold text-xs sm:text-sm ">{metric}</p>
							<p className="font-bold text-sm sm:text-base">{data.value}</p>
						</div>
					</div>
				))}
			</div>

			{/* Buttons */}
			<div className="mt-6 flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
				<Button
					className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
					onClick={() =>
						navigate("/recent-static-scans/hotspots", {
							state: { hotspots: response.report.issues },
						})
					}
				>
					View Hotspots
				</Button>
				<Button
					className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
					onClick={() =>
						navigate("/recent-static-scans/issues", {
							state: { issues: response.report.issues },
						})
					}
				>
					View Issues
				</Button>
			</div>
		</Card>
	);
};

export default UserStaticScans;
