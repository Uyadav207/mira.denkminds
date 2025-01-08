import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import useStore from "../../store/store";

type Scan = {
	_id: string;
	targetUrl: string;
	status: "yellow" | "red";
	complianceStandard: string;
	scanedAt: string;
	totalIssues?: number;
	scanType: string;
	_creationTime: string;
};

const UserScans: React.FC = () => {
	const user = useStore((state) => state.user);
	if (!user) {
		return null;
	}
	const { id } = user;
	const navigate = useNavigate();

	const scans = useQuery(api.scans.fetchScansByUserIdWithoutRisks, {
		userId: String(id),
	});

	if (!scans) {
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
		<div className="rounded-lg border p-6 bg-sidebar">
			<h2 className="text-xl font-semibold mb-4 p-4">Recent Scans</h2>
			{scans.map((scan: Scan) => (
				// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
				<div
					key={scan._id}
					onClick={() => navigate(`/recent-scan/${scan._id}`)}
					className="flex items-center justify-between border-b pb-4 pt-4 px-3 rounded-sm last:border-none hover:bg-secondary-combi cursor-pointer"
				>
					<div className="flex items-center space-x-3">
						<span
							className={`w-4 h-4 rounded-full ${
								scan.complianceStandard === "yellow"
									? "bg-yellow-500"
									: "bg-red-500"
							}`}
						/>
						<span className="text-purple-600 hover:underline">
							{scan.targetUrl}
						</span>
						<Badge variant="secondary">
							{scan.complianceStandard}
						</Badge>
						<Badge
							className={`${
								scan.scanType === "passive"
									? "bg-yellow-500"
									: "bg-green-500"
							}`}
						>
							{scan.scanType}
						</Badge>
					</div>
					<div className="flex justify-evenly gap-4">
						<Badge variant="destructive">{scan.totalIssues}</Badge>
						<span className="text-sm text-gray-400">
							{new Date(scan._creationTime).toLocaleString()}
						</span>
					</div>
				</div>
			))}
		</div>
	);
};

export default UserScans;
