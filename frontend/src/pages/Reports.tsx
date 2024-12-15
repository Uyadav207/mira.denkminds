import { useState } from "react";
import { EmptyState } from "../components/folder/EmptyState";
import { CreateFolderDialog } from "../components/folder/CreateFolderDialog";
import { FolderGrid } from "../components/folder/FolderGrid";
import { FolderView } from "../components/folder/FolderView";
import type { Folder, File } from "../types/reports";

export function Reports() {
	const [folders, setFolders] = useState<Folder[]>([]);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

	const handleCreateFolder = (name: string) => {
		const newFolder: Folder = {
			id: crypto.randomUUID(),
			name,
			files: [],
			createdAt: new Date(),
		};
		setFolders([...folders, newFolder]);
	};

	const handleUploadFile = (folderId: string, file: File) => {
		setFolders(
			folders.map((folder) => {
				if (folder.id === folderId) {
					return { ...folder, files: [...folder.files, file] };
				}
				return folder;
			}),
		);
	};

	const currentFolder = folders.find(
		(folder) => folder.id === currentFolderId,
	);

	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			{folders.length === 0 ? (
				<EmptyState
					onCreateFolder={() => setIsCreateDialogOpen(true)}
				/>
			) : currentFolder ? (
				<FolderView
					folder={currentFolder}
					onUploadFile={handleUploadFile}
					onBack={() => setCurrentFolderId(null)}
				/>
			) : (
				<FolderGrid
					folders={folders}
					onCreateFolder={() => setIsCreateDialogOpen(true)}
					onFolderClick={(folderId) => setCurrentFolderId(folderId)}
				/>
			)}

			<CreateFolderDialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				onCreateFolder={handleCreateFolder}
			/>
		</div>
	);
}
