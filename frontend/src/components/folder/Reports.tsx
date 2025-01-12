import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { EmptyState } from "./EmptyState";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { FolderGrid } from "./FolderGrid";
import type { Folder } from "../../types/reports";

export function Reports() {
	const [folders, setFolders] = useState<Folder[]>([]);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	const handleCreateFolder = (name: string) => {
		const newFolder: Folder = {
			_id: crypto.randomUUID(),
			folderName: name,
			files: [],
			createdAt: new Date(),
		};
		setFolders([...folders, newFolder]);
	};

	// const handleUploadFile = (folderId: string, file: File) => {
	// 	setFolders(
	// 		folders.map((folder) => {
	// 			if (folder.id === folderId) {
	// 				return { ...folder, files: [...folder.files, file] };
	// 			}
	// 			return folder;
	// 		}),
	// 	);
	// };

	return (
		<Router>
			<div className="flex flex-1 flex-col gap-4 p-4">
				<Routes>
					<Route
						path="/"
						element={
							folders.length === 0 ? (
								<EmptyState
									onCreateFolder={() =>
										setIsCreateDialogOpen(true)
									}
								/>
							) : (
								<FolderGrid
									folders={folders}
									onCreateFolder={() =>
										setIsCreateDialogOpen(true)
									}
									onFolderClick={() => {
										// handle folder click
									}}
								/>
							)
						}
					/>
				</Routes>

				<CreateFolderDialog
					open={isCreateDialogOpen}
					onOpenChange={setIsCreateDialogOpen}
					onCreateFolder={handleCreateFolder}
				/>
			</div>
		</Router>
	);
}

