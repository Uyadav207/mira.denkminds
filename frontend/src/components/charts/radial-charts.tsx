import { Separator } from "../../components/ui/separator";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import zapResponse from "../../data/response.json";

const RadialSemiCircleChart: React.FC = () => {
	const metrics = {
		uniqueUrls: zapResponse.filteredResults.unique_urls,
	};

	const series = [100];

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

	return (
		<div className="flex flex-col justify-between items-center h-full">
			{/* Radial Bar Chart */}
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

			{/* Metrics Section */}
			<div className="grid grid-cols-3 gap-6 w-full max-w-md mt-6">
				<div className="text-center">
					<p className="text-sm font-semibold">{metrics.uniqueUrls}</p>
					<p className="text-lg font-bold">Unique URLs</p>
				</div>
				<div className="text-center">
					<p className="text-sm font-semibold">1</p>
					<p className="text-lg font-bold">Forms</p>
				</div>
				<div className="text-center">
					<p className="text-sm font-semibold">0</p>
					<p className="text-lg font-bold">APIs</p>
				</div>
			</div>
		</div>
	);
};

export default RadialSemiCircleChart;
