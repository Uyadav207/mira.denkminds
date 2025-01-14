import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@components/ui/button";
import { ArrowLeft, DownloadIcon } from "lucide-react";
import MarkdownViewer from "./MarkdownViewer";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import html2pdf from "html2pdf.js";

export function FileView() {
	const navigate = useNavigate();
	const { fileId: folderIdParams } = useParams<{ fileId: string }>();
	const fileId = folderIdParams as string;

	const file = useQuery(
		api.reports.getFileById,
		fileId && {
			fileId: String(fileId),
		},
	);
	const downloadAsPDF = () => {
		if (file) {
			const element = document.getElementById("markdown-content");
			if (element) {
				element.classList.add("pdf-export");
			}
			const opt = {
				margin: [20, 20, 20, 20],
				filename: `${file.name}.pdf`,
				image: { type: "jpeg", quality: 0.98 },
				html2canvas: {
					scale: 2,
					useCORS: true,
					logging: false,
				},
				jsPDF: {
					unit: "mm",
					format: "a4",
					orientation: "portrait",
				},
				pagebreak: { mode: "css", before: ".page-break" },
			};

			html2pdf()
				.set(opt)
				.from(element)
				.save()
				.then(() => {
					// Remove PDF-specific styles after generation
					if (element) {
						element.classList.remove("pdf-export");
					}
				});
		}
	};
	return (
		<div className="p-4 space-y-4">
			<Button variant="outline" onClick={() => navigate(-1)}>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Files
			</Button>
			{!file ? (
				<>Loading</>
			) : (
				<div className="p-6 border rounded-lg">
					<div className="flex justify-between items-center mb-4">
						<h1 className="text-xl font-bold">{file.name}</h1>
						<Button
							onClick={downloadAsPDF}
							// onClick={downloadAsPDF}
						>
							<DownloadIcon className="mr-2 h-4 w-4" />
							Download as PDF
						</Button>
					</div>
					<div id="markdown-content">
						<MarkdownViewer content={file.markdownContent} />
					</div>
				</div>
			)}
		</div>
	);
}
