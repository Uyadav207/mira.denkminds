import DonutChart from "../components/charts/donut-charts";
import RadialSemiCircleChart from "../components/charts/radial-charts";
import ScanInfo from "../components/zapScan/scan-info";
import StackedColumnChart from "../components/charts/bar-chart";

export function Dashboard() {
	return (
		<div className="flex flex-1 flex-col gap-6 p-6">
			<div className="grid grid-cols-5 gap-6">
				<div className="bg-transparent border border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 shadow-md col-span-2">
					<h3 className="text-xl font-semibold mb-4">Scan Info</h3>
					<ScanInfo />
				</div>

				<div className="bg-transparent border border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 shadow-md col-span-3">
					<h3 className="text-xl font-semibold mb-4 ">Scanning Status</h3>
					<RadialSemiCircleChart />
				</div>
			</div>

			<div className="grid grid-cols-2 gap-6">
				<div className="bg-transparent border border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 shadow-md">
					<h3 className="text-xl font-semibold mb-4">
						Vulnerabilities by Severity
					</h3>
					<DonutChart />
				</div>

				<div className="bg-transparent border border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 shadow-md">
					<h3 className="text-xl font-semibold mb-4">
						Vulnerabilities by request type
					</h3>
					<StackedColumnChart />
				</div>
			</div>

			{/* <div className="bg-transparent border border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 shadow-md">
				<h3 className="text-xl font-semibold mb-4">Certificate Score</h3>
				<MultilayeredRadialChart />
			</div> */}
		</div>
	);
}
