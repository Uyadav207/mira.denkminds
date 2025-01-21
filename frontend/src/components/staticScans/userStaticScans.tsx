import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useNavigate } from "react-router-dom";

const UserStaticScans: React.FC = () => {
	const navigate = useNavigate();
	const scanData = {
		title: "TIWAP",
		visibility: "PUBLIC",
		lastAnalysis: "3 hours ago",
		status: "Passed",
		metrics: {
			Security: { value: 5, level: "E" },
			Reliability: { value: 20, level: "D" },
			Maintainability: { value: 52, level: "A" },
			HotspotsReviewed: { value: "0.0%", level: "E" },
			Coverage: { value: "0.0%", level: "E" },
			Duplications: { value: "7.7%", level: "C" },
		},
	};

	return (
		<Card className="rounded-lg border p-6 bg-sidebar shadow-md">
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center space-x-2">
					<h1 className="text-2xl font-semibold text-gray-800">
						{scanData.title}
					</h1>
					<Badge className="bg-gray-200 text-gray-600">
						{scanData.visibility}
					</Badge>
				</div>
				<Badge className="bg-green-100 text-green-700 px-3 py-1">
					{scanData.status}
				</Badge>
			</div>

			{/* Metadata */}
			<div className="text-gray-500 text-sm mb-4">
				Last analysis: {scanData.lastAnalysis}
			</div>

			{/* Metrics */}
			<div className="grid grid-cols-3 gap-4 text-sm">
				{Object.entries(scanData.metrics).map(([metric, data]) => (
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
							<p className="font-semibold text-gray-800">{metric}</p>
							<p className="text-gray-500">{data.value}</p>
						</div>
					</div>
				))}
			</div>

			{/* Buttons */}
			<div className="mt-6 flex justify-end space-x-4">
				<Button
					className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
					onClick={() => navigate("/recent-static-scans/hotspots")}
				>
					View Hotspots
				</Button>
				<Button
					className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
					onClick={() => navigate("/recent-static-scans/issues")}
				>
					View Issues
				</Button>
			</div>
		</Card>
	);
};

export default UserStaticScans;
