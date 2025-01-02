import { Separator } from "../../components/ui/separator";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

const RadialSemiCircleChart: React.FC = () => {
	const options: ApexOptions = {
		chart: {
			type: "radialBar",
			offsetY: 0,
			sparkline: {
				enabled: true,
			},
		},
		plotOptions: {
			radialBar: {
				startAngle: -120,
				endAngle: 120,
				hollow: {
					size: "70%",
				},
				track: {
					background: "#e0e0e0",
					strokeWidth: "100%",
					margin: 5,
				},
				dataLabels: {
					name: {
						offsetY: -40,
						fontSize: "16px",
						fontWeight: "600",
						color: "#4C88FF",
					},
					value: {
						offsetY: 20,
						fontSize: "30px",
						fontWeight: "bold",
						color: "#000",
					},
				},
			},
		},
		colors: ["#4C88FF"],
		labels: ["Scanning"],
	};

	const series = [100];

	const complianceData = [
		{ name: "ISO27001-A", issues: 2, color: "bg-red-500" },
	];

	return (
		<div className="flex flex-col justify-between items-center h-full">
			<div
				className="flex-grow flex items-center justify-center"
				style={{
					height: "300px",
					minHeight: "300px",
				}}
			>
				<Chart
					options={options}
					series={series}
					type="radialBar"
					height={300}
				/>
			</div>

			<div className="mt-4 w-full max-w-md">
				<Separator />
			</div>

			<div className="grid grid-cols-3 gap-6 w-full max-w-md mt-6">
				<div className="text-center">
					<p className="text-2xl font-bold">7</p>
					<p className="text-gray-600">Crawled Pages</p>
					<p className="text-green-500 text-sm">0 Auth Uris</p>
				</div>
				<div className="text-center">
					<p className="text-2xl font-bold">1</p>
					<p className="text-gray-600">Forms</p>
					<p className="text-green-500 text-sm">0 Auth Uris</p>
				</div>
				<div className="text-center">
					<p className="text-2xl font-bold">0</p>
					<p className="text-gray-600">APIs</p>
					<p className="text-green-500 text-sm">0 Auth Uris</p>
				</div>
			</div>

			{/* Compliance Status */}
			<div className="mt-6 w-full max-w-md p-4 rounded-xl">
				<h2 className="text-lg font-bold mb-4">Compliance Status</h2>
				{complianceData.map((item) => (
					<div key={item.name} className="mb-4">
						<div className="flex justify-between items-center">
							<div className="flex items-center space-x-2">
								<div
									className={`w-4 h-4 rounded-full ${
										item.issues > 0 ? "bg-red-500" : "bg-green-500"
									}`}
								/>
								<span className="text-gray-700 font-medium">{item.name}</span>
							</div>
							<span
								className={`font-semibold ${
									item.issues > 0 ? "text-red-500" : "text-green-500"
								}`}
							>
								{item.issues > 0 ? `${item.issues} Issues` : "✓"}
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
							<div
								className={`${item.color} h-2.5 rounded-full`}
								style={{
									width: `${item.issues > 0 ? 50 : 100}%`,
								}}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default RadialSemiCircleChart;
