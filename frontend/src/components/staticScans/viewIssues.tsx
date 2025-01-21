import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";

const ViewIssues: React.FC = () => {
	const navigate = useNavigate();
	const hotspots = [
		{
			id: 1,
			title:
				"Refactor this function to reduce its Cognitive Complexity from 21 to the 15 allowed.",
			category: "Maintainability",
			line: "L530",
			effort: "11min",
			age: "3 years ago",
			tag: "brain-overload",
		},
		{
			id: 2,
			title:
				"Define a constant instead of duplicating this literal 'vulnerabilities/insecure-file-upload.html' 5 times.",
			category: "Maintainability",
			line: "L533",
			effort: "10min",
			age: "3 years ago",
			tag: "design",
		},
		{
			id: 3,
			title:
				"Define a constant instead of duplicating this literal 'No file selected!' 3 times.",
			category: "Maintainability",
			line: "L539",
			effort: "6min",
			age: "3 years ago",
			tag: "design",
		},
	];

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4"> Issues</h1>
			<div className="grid gap-4">
				{hotspots.map((hotspot) => (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<div
						key={hotspot.id}
						className="relative border rounded-md p-4  bg-sidebar"
						onClick={() => navigate("/recent-static-scans/issues/details")}
					>
						<span className="absolute top-2 right-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
							{hotspot.tag}
						</span>

						<p className="text-lg font-semibold ">{hotspot.title}</p>
						<div className="flex items-center space-x-2 mt-2 text-sm">
							<Badge className="bg-red-100 text-red-600">
								{hotspot.category}
							</Badge>
							<p className="text-gray-500">{hotspot.line}</p>
							<p className="text-gray-500">{hotspot.effort}</p>
							<p className="text-gray-500">{hotspot.age}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ViewIssues;
