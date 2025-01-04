import zapResponse from "../../data/response.json";
import useStore from "../../store/store";
const name = useStore.getState().user?.firstName || "Unknown User";
const scanDetails = [
	{
		id: "target",
		label: "Target",
		value: zapResponse.targetUrl,
		copyable: true,
	},
	{
		id: "compliance-standard",
		label: "Compliance Standard",
		value: zapResponse.complianceStandard,
	},
	{ id: "last-scan", label: "Last Scan", value: "December 25, 2024 7:48 PM" },
	{ id: "initiated-by", label: "Initiated By", value: name },
];

export default scanDetails;
