import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@components/ui/button";
import { ArrowLeft, DownloadIcon } from "lucide-react";
import MarkdownViewer from "./MarkdownViewer";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

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
