import type React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";

type UrlData = {
	id: string;
	method: "GET" | "POST" | "PUT" | "DELETE";
	endpoint: string;
};

const Url: React.FC = () => {
	const { vulnId } = useParams<{ vulnId: string }>();
	const navigate = useNavigate();
	const [urlData, setUrlData] = useState<UrlData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUrlData = async () => {
			setLoading(true);

			// Replace with your actual API logic
			const mockData: Record<string, UrlData[]> = {
				"1": [
					{ id: "1", method: "GET", endpoint: "/" },
					{ id: "2", method: "GET", endpoint: "/blogs/week-1" },
					{ id: "3", method: "PUT", endpoint: "/blogs/week-2" },
					{ id: "4", method: "GET", endpoint: "/blogs/week-3" },
				],
				"2": [
					{ id: "1", method: "POST", endpoint: "/api/submit" },
					{ id: "2", method: "DELETE", endpoint: "/api/resource" },
				],
			};

			// Simulating an API call with setTimeout
			setTimeout(() => {
				setUrlData(mockData[vulnId || "1"] || []); // Fallback for invalid vulnId
				setLoading(false);
			}, 1000);
		};

		fetchUrlData();
	}, [vulnId]);

	if (loading) {
		return (
			<div className="rounded-lg">
				<div className="flex items-center space-x-2 bg-popover rounded-md px-2 py-2 animate-pulse">
					<div className="w-4 h-4 bg-secondary rounded-full" />
					<div className="w-24 h-4 bg-secondary rounded" />
				</div>
				{/* Skeleton Loading */}
				<div className="space-y-4 mt-4">
					{Array.from({ length: 4 }).map((_, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							key={index}
							className="flex items-center space-x-3 p-4 rounded-md animate-pulse"
						>
							<div className="w-16 h-6 bg-secondary rounded" />
							<div className="w-full h-6 bg-secondary rounded" />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-lg p-4">
			<button type="button" className="mb-4" onClick={() => navigate(-1)}>
				← Affected URLs
			</button>

			<div className="space-y-2">
				{/* <h1 className="text-xl mt-3 font-semibold">Affected Uris</h1> */}
				{urlData.map((url) => (
					<div
						key={url.id}
						className="flex items-center space-x-3 p-4 border bg-sidebar rounded-sm"
					>
						<Badge
							className={`px-3 py-1 rounded text-xs font-semibold ${
								url.method === "GET"
									? "bg-green-500 text-white"
									: url.method === "POST"
										? "bg-blue-500 text-white"
										: url.method === "PUT"
											? "bg-yellow-500 text-white"
											: "bg-red-500 text-white"
							}`}
						>
							{url.method}
						</Badge>
						<span className="font-semibold">{url.endpoint}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default Url;
