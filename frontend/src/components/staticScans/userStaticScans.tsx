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
		<Card className="rounded-lg border p-6 bg-sidebar shadow-md">
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center space-x-2">
					<h1 className="text-2xl font-semibold ">{scanData.title}</h1>
					<Badge className="bg-gray-200 text-gray-600">
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
			<div className="text-gray-500 text-sm mb-4">
				Last analysis: {scanData.lastAnalysis}
			</div>

			{/* Metrics */}
			<div className="grid grid-cols-4 gap-4 text-sm">
				{metrics.slice(0, 4).map(([metric, data]) => (
					<div key={metric} className="flex items-center space-x-2">
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
							<p className="font-semibold ">{metric}</p>
							<p className="font-bold">{data.value}</p>
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-4 gap-4 text-sm mt-4">
				{metrics.slice(4).map(([metric, data]) => (
					<div key={metric} className="flex items-center space-x-2">
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
							<p className="font-semibold ">{metric}</p>
							<p className="font-bold">{data.value}</p>
						</div>
					</div>
				))}
			</div>

			{/* Buttons */}
			<div className="mt-6 flex justify-end space-x-4">
				<Button
					className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
					onClick={() =>
						navigate("/recent-static-scans/hotspots", {
							state: { hotspots: response.report.issues },
						})
					}
				>
					View Hotspots
				</Button>
				<Button
					className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
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
