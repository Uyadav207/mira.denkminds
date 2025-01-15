import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@components/ui/button";
import { ArrowLeft, DownloadIcon } from "lucide-react";
import MarkdownViewer from "./MarkdownViewer";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import html2pdf from "html2pdf.js";
import "../../../public/Mira_logo.png";

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
				// element.classList.add("pdf-export");
				// Create a clone of the element to avoid modifying the visible content
				const clonedElement = element.cloneNode(true) as HTMLElement;
				clonedElement.classList.add("pdf-export");

				// Add the footer to the cloned element
				// const footer = document.createElement("div");
				// footer.classList.add("pdf-footer");
				// footer.innerHTML = `<p>Page Footer - <a href="denkminds.vercel.app">denkMinds</a></p>`;
				// clonedElement.appendChild(footer);

				// Temporarily append the cloned element to the body
				document.body.appendChild(clonedElement);

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
					.from(clonedElement)
					.save()
					// .then(() => {
					// 	// Remove PDF-specific styles after generation
					// 	if (element) {
					// 		element.classList.remove("pdf-export");
					// 	}
					// });
					.then(() => {
						// Remove the cloned element after generation
						document.body.removeChild(clonedElement);
					});
			}
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

					<div
						id="markdown-content"
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							flexDirection: "column",
							border: "4px solid #7156DB", // Your border style
							padding: "20px", // Optional padding to make the content look neat inside the border
							borderRadius: "8px",
						}}
					>
						<img src="/Mira_logo.png" alt="Mira Logo" className="h-8" />
						<MarkdownViewer content={file.markdownContent} />
					</div>
				</div>
			)}
		</div>
	);
}
