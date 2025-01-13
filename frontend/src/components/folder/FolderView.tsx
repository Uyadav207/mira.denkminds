import { useNavigate } from "react-router-dom";
import { FileText, Trash, TriangleAlert } from "lucide-react";
import { Button } from "@components/ui/button";

import type { File, Folder } from "../../types/reports";
import { Card } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

type FolderViewProps = {
	folder: Folder;
	reportId: string;
	files: File[];
	onBack: () => void;
};

export function FolderView({ files }: FolderViewProps) {
	const navigate = useNavigate();

	// Handler for navigating to a specific file
	const handleFileInteraction = (
		file: File,
		event: React.MouseEvent | React.KeyboardEvent,
	) => {
		if (
			event.type === "click" ||
			(event.type === "keydown" &&
				(event as React.KeyboardEvent).key === "Enter")
		) {
			navigate(`/file/${file._id}`, { state: { file } });
		}
	};

	// Render fallback for empty file list
	if (!files || files.length === 0) {
		return (
			<Card className="w-full max-w-md mx-auto mt-8 p-8 my-auto shadow-none border-2 border-secondary">
				<Alert variant="default" className="border-none">
					<div className="flex px--5">
						<TriangleAlert className="w-10 h-10 mr-5" />
						<AlertTitle className="text-3xl font-semibold mb-5">
							No Reports Found Yet!
						</AlertTitle>
					</div>
					<AlertDescription className="text-muted-foreground text-base">
						Ask mira to create you a report and come back later.
						Ciao! 👋
					</AlertDescription>
				</Alert>
			</Card>
		);
	}

	return (
		<div className="p-4">
			<Button
				variant="outline"
				onClick={() => navigate("/reports")}
				className="mb-4"
			>
				Back to Folders
			</Button>

			<div className="rounded-lg">
				<div className="overflow-x-auto">
					<table className="table-auto w-full text-left">
						<thead>
							<tr className="bg-sidebar border">
								<th className="p-3">Name</th>
								<th className="p-3">Created on</th>
								<th className="p-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{files.map((file) => (
								<tr
									key={file._id}
									className="border cursor-pointer hover:bg-sidebar"
									onClick={(event) =>
										handleFileInteraction(file, event)
									}
									onKeyDown={(event) =>
										handleFileInteraction(file, event)
									}
									tabIndex={0}
								>
									<td className="p-3 flex items-center gap-3">
										<FileText className="h-6 w-6 font-black" />
										<span className="truncate text-gray font-semibold">
											{file.fileName}
										</span>
									</td>
									<td className="p-3">
										{file.createdAt
											? new Date(
													file.createdAt,
												).toDateString()
											: "N/A"}
									</td>
									<td className="p-3 text-right">
										<Button
											size="sm"
											variant="ghost"
											onClick={(e: Event) => {
												e.stopPropagation();
											}}
										>
											<Trash className="h-5 w-5" />
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
