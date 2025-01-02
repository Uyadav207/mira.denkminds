import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, type PieProps } from "recharts";

const data = [
	{ name: "Critical", value: 10, color: "#FF4C4C" },
	{ name: "Medium", value: 69, color: "#FFB24C" },
	{ name: "Low", value: 90, color: "#4C4CFF" },
	{ name: "Info", value: 8, color: "#4CCAFF" },
];

const DonutChart: React.FC = () => {
	const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

	const total = data.reduce((sum, entry) => sum + entry.value, 0);

	const onPieEnter: PieProps["onMouseEnter"] = (_, index: number) => {
		setHoveredSegment(data[index].name);
	};

	const onPieLeave: PieProps["onMouseLeave"] = () => {
		setHoveredSegment(null);
	};

	return (
		<div className="flex flex-col items-center justify-center relative">
			<div className="relative">
				<PieChart width={400} height={400}>
					<Pie
						data={data}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="50%"
						innerRadius={130}
						outerRadius={160}
						fill="#8884d8"
						paddingAngle={5}
						onMouseEnter={onPieEnter}
						onMouseLeave={onPieLeave}
					>
						{data.map((entry) => (
							<Cell
								key={`cell-${entry.name}`}
								fill={entry.color}
								stroke={hoveredSegment === entry.name ? "#000" : "none"}
								strokeWidth={hoveredSegment === entry.name ? 2 : 0}
							/>
						))}
					</Pie>
					<Tooltip />
				</PieChart>

				<div
					style={{
						position: "absolute",
						textAlign: "center",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
					}}
				>
					<p className="text-lg font-semibold">
						{hoveredSegment !== null ? hoveredSegment : "Total"}
					</p>
					<p className="text-3xl font-bold">
						{hoveredSegment !== null
							? data.find((entry) => entry.name === hoveredSegment)?.value
							: total}
					</p>
				</div>
			</div>

			<div className="flex mt-4 space-x-4">
				{data.map((entry) => (
					<div key={entry.name} className="flex items-center space-x-2">
						<div
							style={{
								width: 12,
								height: 12,
								backgroundColor: entry.color,
							}}
						/>
						<p className="text-sm text-gray-700">{entry.name}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default DonutChart;
