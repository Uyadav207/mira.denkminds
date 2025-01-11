import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@components/ui/button";
import { ArrowLeft, DownloadIcon } from "lucide-react";
import MarkdownViewer from "./MarkdownViewer";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function FileView() {
	const location = useLocation();
	const navigate = useNavigate();
	const { fileId: folderIdParams } = useParams<{ fileId: string }>();
	const fileId = folderIdParams as string;
	// const { file } = location.state;
	const file = useQuery(
		api.reports.getFileById,
		fileId && {
			fileId: String(fileId),
		},
	);

	// const downloadAsPDF = () => {
	// 	const doc = new jsPDF();
	// 	const margin = 20;
	// 	const pageHeight = doc.internal.pageSize.height;
	// 	let y = margin;

	// 	// Add title
	// 	doc.setFont("helvetica", "bold");
	// 	doc.setFontSize(16);
	// 	doc.text(file.name, margin, y);
	// 	y += 10;

	// 	// Reset font for content
	// 	doc.setFont("helvetica", "normal");
	// 	doc.setFontSize(12);

	// 	// Process markdown content
	// 	const lines = file.content.split("\n");

	// 	lines.forEach((line) => {
	// 		// Page break if needed
	// 		if (y > pageHeight - margin) {
	// 			doc.addPage();
	// 			y = margin;
	// 		}

	// 		// Headings
	// 		if (line.startsWith("# ")) {
	// 			doc.setFont("helvetica", "bold");
	// 			doc.setFontSize(16);
	// 			y += 10;
	// 			doc.text(line.replace("# ", ""), margin, y);
	// 			doc.setFont("helvetica", "normal");
	// 			doc.setFontSize(12);
	// 			y += 8;
	// 		} else if (line.startsWith("## ")) {
	// 			doc.setFont("helvetica", "bold");
	// 			doc.setFontSize(14);
	// 			y += 8;
	// 			doc.text(line.replace("## ", ""), margin, y);
	// 			doc.setFont("helvetica", "normal");
	// 			doc.setFontSize(12);
	// 			y += 6;
	// 		} else if (line.startsWith("### ")) {
	// 			doc.setFont("helvetica", "bold");
	// 			doc.setFontSize(12);
	// 			y += 6;
	// 			doc.text(line.replace("### ", ""), margin, y);
	// 			y += 6;
	// 		}
	// 		// Lists
	// 		else if (line.startsWith("- ")) {
	// 			doc.text("•", margin, y);
	// 			const splitText = doc.splitTextToSize(line.replace("- ", ""), 170);
	// 			doc.text(splitText, margin + 5, y);
	// 			y += 6 * splitText.length;
	// 		}
	// 		// Horizontal rule
	// 		else if (line.startsWith("---")) {
	// 			y += 5;
	// 			doc.line(margin, y, doc.internal.pageSize.width - margin, y);
	// 			y += 5;
	// 		}
	// 		// Regular text
	// 		else if (line.trim() !== "") {
	// 			const splitText = doc.splitTextToSize(line, 170);
	// 			doc.text(splitText, margin, y);
	// 			y += 6 * splitText.length;
	// 		} else {
	// 			// Empty line spacing
	// 			y += 6;
	// 		}
	// 	});

	// 	doc.save(`${file.name}.pdf`);
	// };

	return (
		<div className="p-4 space-y-4">
			<Button variant="outline" onClick={() => navigate(-1)}>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Files
			</Button>
			{!file ? (
				<>Loading</>
			) : (
				<div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
					<div className="flex justify-between items-center mb-4">
						<h1 className="text-xl font-bold dark:text-white">
							{file.name}
						</h1>
						<Button
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
