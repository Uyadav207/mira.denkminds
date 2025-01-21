import { Badge } from "../ui/badge";

const ViewHotspots: React.FC = () => {
	const hotspots = [
		{
			id: 1,
			title:
				"Refactor this function to reduce its Cognitive Complexity from 21 to the 15 allowed.",
			category: "Maintainability",
			line: "L530",
			effort: "11min",
			age: "3 years ago",
		},
		{
			id: 2,
			title:
				"Define a constant instead of duplicating this literal 'vulnerabilities/insecure-file-upload.html' 5 times.",
			category: "Maintainability",
			line: "L533",
			effort: "10min",
			age: "3 years ago",
		},
		{
			id: 3,
			title:
				"Define a constant instead of duplicating this literal 'No file selected!' 3 times.",
			category: "Maintainability",
			line: "L539",
			effort: "6min",
			age: "3 years ago",
		},
	];

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4 ">Security Hotspots</h1>
			<div className="grid gap-4">
				{hotspots.map((hotspot) => (
					<div key={hotspot.id} className="border rounded-md p-4 bg-sidebar">
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

export default ViewHotspots;
