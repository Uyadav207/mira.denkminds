import { useEffect, useState } from "react";
import { EmptyState } from "../components/folder/EmptyState";
import { CreateFolderDialog } from "../components/folder/CreateFolderDialog";
import { FolderGrid } from "../components/folder/FolderGrid";
import { FolderView } from "../components/folder/FolderView";
import type { Folder, ConvexFolderType } from "../types/reports";

import { api } from "../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import useStore from "../store/store";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";

export function Reports() {
	const navigate = useNavigate();
	const [folders, setFolders] = useState<Folder[]>([]);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
	const user = useStore((state) => state.user);
	const { reportId: folderIdParams } = useParams<{ reportId: string }>();
	const reportId = folderIdParams as string;

	if (!user) {
		return null;
	}
	const { id } = user;
	const folderData = useQuery(api.reports.getReportFoldersByUser, {
		userId: String(id),
	});

	const filesByFolder = useQuery(
		api.reports.getReportsByFolder,
		reportId && {
			folderId: String(reportId),
		},
	);

	const saveReport = useMutation(api.reports.createReportFolder);
	const handleCreateFolder = async (name: string) => {
		const newFolder: Folder = {
			id: uuidv4(),
			name: name,
			files: [],
			createdAt: new Date(),
		};

		const response = await saveReport({
			folderName: newFolder.name,
			userId: String(id),
		});
		if (response) {
			//success
		}
	};

	useEffect(() => {
		if (folderData) {
			const newFolders: Folder[] = folderData.map(
				(item: ConvexFolderType): Folder => ({
					id: item._id,
					name: item.folderName,
					files: [],
					createdAt: new Date(),
				}),
			);

			setFolders(newFolders);
		}
	}, [folderData]);

	const currentFolder = folders.find(
		(folder) => folder.id === currentFolderId,
	);

	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			{!folderData ? (
				<div>Loading...</div>
			) : (
				<div>
					{folders.length === 0 ? (
						<EmptyState
							onCreateFolder={() => setIsCreateDialogOpen(true)}
						/>
					) : reportId ? (
						<FolderView
							folder={currentFolder as Folder}
							reportId={reportId}
							files={filesByFolder}
							onBack={() => setCurrentFolderId(null)}
						/>
					) : (
						folders && (
							<FolderGrid
								folders={folders}
								onCreateFolder={() =>
									setIsCreateDialogOpen(true)
								}
								onFolderClick={(folderId) => {
									navigate(`/reports/${folderId}`);
									setCurrentFolderId(folderId);
								}}
							/>
						)
					)}
				</div>
			)}

			<CreateFolderDialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				onCreateFolder={handleCreateFolder}
			/>
		</div>
	);
}
