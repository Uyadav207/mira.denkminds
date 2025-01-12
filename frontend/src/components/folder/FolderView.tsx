import { useNavigate } from "react-router-dom";
import { FileText, Trash } from "lucide-react";
import { Button } from "@components/ui/button";

import type { File, Folder } from "../../types/reports";

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
			navigate(`/file/${file.id}`, { state: { file } });
		}
	};

	// Render fallback for empty file list
	if (!files || files.length === 0) {
		return (
			<div className="p-4">
				<Button
					variant="outline"
					onClick={() => navigate("/reports")}
					className="mb-4"
				>
					Back to Folders
				</Button>
				<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center">
					<p className="text-gray-500 dark:text-gray-400">
						No files found in this folder.
					</p>
				</div>
			</div>
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

			<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
				<div className="overflow-x-auto">
					<table className="table-auto w-full text-left">
						<thead>
							<tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
								<th className="p-3">Name</th>
								<th className="p-3">Created on</th>
								<th className="p-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{files.map((file) => (
								<tr
									key={file.id}
									className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
									onClick={(event) =>
										handleFileInteraction(file, event)
									}
									onKeyDown={(event) =>
										handleFileInteraction(file, event)
									}
									tabIndex={0} // Makes the row focusable via keyboard
								>
									<td className="p-3 flex items-center gap-3">
										<FileText className="h-6 w-6 text-blue-500" />
										<span className="truncate dark:text-gray-100">
											{file.name}
										</span>
									</td>
									<td className="p-3 text-gray-600 dark:text-gray-400">
										{file.createdAt
											? new Date(
													file.createdAt,
												).toLocaleDateString()
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
