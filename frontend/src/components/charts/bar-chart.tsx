import type React from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

const StackedColumnChart: React.FC = () => {
	const options: ApexOptions = {
		chart: {
			type: "bar",
			stacked: true,
			toolbar: {
				show: false,
			},
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: "70%",
			},
		},
		dataLabels: {
			enabled: true,
			style: {
				fontSize: "14px",
				colors: ["#000"],
			},
		},
		grid: {
			show: false,
			padding: {
				left: 0,
				right: 0,
				bottom: 0,
			},
		},
		colors: ["#FF4C4C", "#FFB24C", "#4C4CFF", "#4CCAFF"],
		xaxis: {
			categories: ["AUTH", "UNAUTH", "API", "JS", "CSS", "OTHERS"],
			labels: {
				style: {
					fontSize: "14px",
				},
				rotate: 0,
			},
		},
		yaxis: {
			labels: {
				style: {
					fontSize: "14px",
				},
				offsetX: -5,
			},
			title: {
				text: "Count",
				style: {
					fontSize: "16px",
					color: "#333",
				},
			},
		},
		legend: {
			position: "top",
			horizontalAlign: "right",
			labels: {
				useSeriesColors: true,
			},
		},
		tooltip: {
			shared: true,
			intersect: false,
		},
	};

	const series = [
		{
			name: "Critical",
			data: [0, 0, 0, 0, 0, 0],
		},
		{
			name: "Medium",
			data: [0, 65, 0, 39, 0, 65],
		},
		{
			name: "Low",
			data: [0, 0, 0, 0, 3, 0],
		},
		{
			name: "Info",
			data: [0, 0, 0, 0, 0, 0],
		},
	];

	return (
		<div className="w-full h-full p-6">
			<Chart
				options={options}
				series={series}
				type="bar"
				height="100%"
				width="100%"
			/>
		</div>
	);
};

export default StackedColumnChart;
