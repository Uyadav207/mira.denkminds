import { useState } from "react";
import { EmptyState } from "../components/folder/EmptyState";
import { CreateFolderDialog } from "../components/folder/CreateFolderDialog";
import { FolderGrid } from "../components/folder/FolderGrid";
import { FolderView } from "../components/folder/FolderView";
import { Loader2 } from "lucide-react";

import useStore from "../store/store";

import type { File, Folder } from "../types/reports";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { showErrorToast } from "../components/toaster";

// Validation helper
const validateFolderName = (name: string, existingFolders: Folder[]) => {
	if (!name || name.trim().length === 0) {
		return "Folder name cannot be empty";
	}
	if (name.length > 50) {
		return "Folder name must be less than 50 characters";
	}
	if (
		existingFolders.some(
			(folder) => folder.folderName.toLowerCase() === name.toLowerCase(),
		)
	) {
		return "A folder with this name already exists";
	}
	return null;
};

export function Reports() {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

	// Get user from store
	const user = useStore((state) => state.user);
	if (!user) return null;
	const { id } = user;

	// Convex queries and mutations
	const folders = useQuery(api.reports.getReportFoldersByUser, {
		userId: String(id),
	});
	const reports = useQuery(
		api.reports.getReportsByFolder,
		currentFolderId ? { folderId: currentFolderId } : "skip",
	);

	const createFolder = useMutation(api.reports.createReportFolder);
	const addReport = useMutation(api.reports.addReport);

	// Handlers
	const handleCreateFolder = async (name: string) => {
		try {
			const validationError = validateFolderName(name, folders || []);
			if (validationError) {
				showErrorToast(validationError);
				return;
			}

			await createFolder({
				userId: String(id),
				folderName: name.trim(),
			});
			setIsCreateDialogOpen(false);
		} catch (err) {
			if (err instanceof Error) {
				showErrorToast(err.message || "Failed to create folder");
			} else {
				showErrorToast("Failed to create folder");
			}
		}
	};

	const handleUploadFile = async (folderId: string, file: File) => {
		try {
			// Here you would typically upload the file to your storage service first
			// For this example, we'll assume it returns a URL
			const fileUrl = "your-file-url"; // Replace with actual file upload logic

			await addReport({
				folderId,
				fileName: file.name,
				fileUrl,
			});
		} catch (err) {
			if (err instanceof Error) {
				showErrorToast(err.message || "Failed to upload file");
			} else {
				showErrorToast("Failed to upload file");
			}
		}
	};

	// Loading state
	if (folders === undefined) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	const currentFolder: Folder | undefined = folders?.find(
		(folder: Folder) => folder._id === currentFolderId,
	);

	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			{folders.length === 0 ? (
				<EmptyState
					onCreateFolder={() => setIsCreateDialogOpen(true)}
				/>
			) : currentFolder ? (
				<FolderView
					folder={{
						_id: currentFolder._id,
						folderName: currentFolder.folderName,
						files: reports || [],
						createdAt: new Date(currentFolder.createdAt),
					}}
					onUploadFile={handleUploadFile}
					onBack={() => setCurrentFolderId(null)}
				/>
			) : (
				<FolderGrid
					folders={folders.map((f: Folder) => ({
						_id: f._id,
						folderName: f.folderName,
						files: [],
						createdAt: new Date(f.createdAt),
					}))}
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

export default Reports;
