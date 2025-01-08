import type React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// type VulnerabilityInfo = {
// 	_creationTime: number;
// 	_id: string;
// 	affectedUrls: {
// 		attack: string;
// 		evidence: string;
// 		method: "GET" | "POST" | "PUT" | "DELETE";
// 		uri: string;
// 	}[];
// 	confidence: string;
// 	cveIds: string[];
// 	cweId: string;
// 	reference: string;
// 	riskLevel: string;
// 	solution: string;
// 	vulnerabilityId: string;
// };

const Url: React.FC = () => {
	const { vulnerabilityId } = useParams<{ vulnerabilityId: string }>();
	const navigate = useNavigate();
	const vulnerabilityInfos = useQuery(
		api.vulnerabilityInfo.fetchVulnerabilityInfoByVId,
		{
			vulnerabilityId,
		},
	);

	if (!vulnerabilityInfos) {
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

			<div className="justify-between mb-5 mr-8">
				<div className="w-auto p-5 border bg-sidebar rounded-lg mb-5">
					<h1 className="font-bold mb-3">Description</h1>

					<div
						// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
						dangerouslySetInnerHTML={{
							__html: vulnerabilityInfos[0].description,
						}}
					/>
				</div>
				<div className="w-50 p-5 border rounded-lg bg-sidebar table-responsive">
					<h1 className="font-bold text-lg mb-4">Info</h1>
					<table className="table-auto border-collapse border w-auto">
						<tbody>
							<tr className="border-b">
								<td className="font-bold px-4 py-2">Confidence</td>
								<td className="px-4 py-2">
									{vulnerabilityInfos[0].confidence}
								</td>
							</tr>
							<tr className="border-b">
								<td className="font-bold px-4 py-2">CWE ID</td>
								<td className="px-4 py-2">{vulnerabilityInfos[0].cweId}</td>
							</tr>
							<tr className="border-b">
								<td className="font-bold px-4 py-2">References</td>
								<td className="px-4 py-2">
									<ul className="list-disc pl-5">
										{vulnerabilityInfos[0].reference
											.split("</p>")
											.filter((ref: string) => ref.trim())
											.map((ref: string, index: number) => (
												// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
												<li key={index}>
													<a
														href={ref.replace("<p>", "").trim()}
														target="_blank"
														rel="noopener noreferrer"
														className="text-purple-500 hover:underline"
													>
														{ref.replace("<p>", "").trim()}
													</a>
												</li>
											))}
									</ul>
								</td>
							</tr>
							<tr>
								<td className="font-bold px-4 py-2">Solution</td>
								<td
									className="px-4 py-2"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
									dangerouslySetInnerHTML={{
										__html: vulnerabilityInfos[0].solution,
									}}
								/>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<div className="space-y-2">
				{vulnerabilityInfos[0].affectedUrls.map(
					(affectedUri: {
						attack: string;
						evidence: string;
						method: "GET" | "POST" | "PUT" | "DELETE";
						uri: string;
					}) => (
						<div
							key={affectedUri.uri}
							className="flex items-center space-x-3 p-4 border bg-sidebar rounded-sm"
						>
							<Badge
								className={`px-3 py-1 rounded text-xs font-semibold ${
									affectedUri.method === "GET"
										? "bg-green-500 text-white"
										: affectedUri.method === "POST"
											? "bg-blue-500 text-white"
											: affectedUri.method === "PUT"
												? "bg-yellow-500 text-white"
												: "bg-red-500 text-white"
								}`}
							>
								{affectedUri.method}
							</Badge>
							<span className="font-semibold">{affectedUri.uri}</span>
						</div>
					),
				)}
			</div>
		</div>
	);
};

export default Url;
