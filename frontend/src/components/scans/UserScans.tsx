import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";

type Scan = {
	targetUrl: string;
	status: "yellow" | "red";
	CompilanceStandard: string;
	scanedAt: string;
	totalVulnerabilities?: number;
	scanId: string;
};

const UserScans: React.FC = () => {
	const navigate = useNavigate();
	const [scans, setScans] = useState<Scan[]>([]);
	const [loading, setLoading] = useState(true);

	// Mimic API call on component mount
	useEffect(() => {
		const fetchScans = async () => {
			setLoading(true);

			// Simulate an API call with mock data
			const mockScans: Scan[] = [
				{
					scanId: "1",
					targetUrl: "https://denkminds.vercel.app",
					status: "yellow",
					CompilanceStandard: "GDPR",
					scanedAt: "a month ago",
					totalVulnerabilities: 100,
				},
				{
					scanId: "2",
					targetUrl: "https://vulnerable.zerothreat.ai",
					status: "red",
					CompilanceStandard: "NIST",
					scanedAt: "8 months ago",
					totalVulnerabilities: 33,
				},
				{
					scanId: "3",
					targetUrl: "https://aspdotnet.vulnerable.zerothreat.ai",
					status: "red",
					CompilanceStandard: "ISO",
					scanedAt: "8 months ago",
					totalVulnerabilities: 22,
				},
			];

			// Simulate API delay
			setTimeout(() => {
				setScans(mockScans);
				setLoading(false);
			}, 1500);
		};

		fetchScans();
	}, []);

	if (loading) {
		return (
			<div className="rounded-lg border p-6">
				<div className="flex items-center justify-between space-x-4 mb-4">
					<div className="w-32 h-4 bg-secondary rounded animate-pulse" />
				</div>
				{/* Skeleton Items */}
				{Array.from({ length: 3 }).map((_, index) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={index}
						className="flex items-center justify-between border-b pb-4 pt-4 px-3 rounded-sm last:border-none hover:bg-secondary-combi cursor-pointer animate-pulse"
					>
						<div className="flex items-center space-x-3">
							<span className="w-4 h-4 rounded-full bg-secondary" />
							<span className="bg-secondary w-32 h-4 rounded" />
							<span className="bg-secondary w-20 h-4 rounded" />
						</div>
						<div className="flex justify-evenly gap-4">
							<span className="bg-secondary w-10 h-4 rounded" />
							<span className="bg-secondary w-16 h-4 rounded" />
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="rounded-lg border p-6">
			<h2 className="text-xl font-semibold mb-4 p-4">Recent Scans</h2>
			{scans.map((scan) => (
				// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
				<div
					key={scan.scanId}
					onClick={() => navigate(`/recent-scan/${scan.scanId}`)}
					className="flex items-center justify-between border-b pb-4 pt-4 px-3 rounded-sm last:border-none hover:bg-secondary-combi cursor-pointer"
				>
					<div className="flex items-center space-x-3">
						<span
							className={`w-4 h-4 rounded-full ${
								scan.status === "yellow" ? "bg-yellow-500" : "bg-red-500"
							}`}
						/>
						<span className="text-purple-600 hover:underline">
							{scan.targetUrl}
						</span>
						<Badge variant="secondary">{scan.CompilanceStandard}</Badge>
					</div>
					<div className="flex justify-evenly gap-4">
						<Badge variant="destructive">{scan.totalVulnerabilities}</Badge>
						<span className="text-sm text-gray-400">{scan.scanedAt}</span>
					</div>
				</div>
			))}
		</div>
	);
};

export default UserScans;
