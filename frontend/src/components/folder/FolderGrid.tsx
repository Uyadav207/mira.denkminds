import { FolderIcon, Search } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { Folder } from "../../types/reports";

interface FolderGridProps {
	folders: Folder[];
	onCreateFolder: () => void;
	onFolderClick: (folderId: string) => void;
}

export function FolderGrid({
	folders,
	onCreateFolder,
	onFolderClick,
}: FolderGridProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input placeholder="Search folders..." className="pl-8" />
				</div>
				<Button onClick={onCreateFolder}>Create Folder</Button>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{folders.map((folder) => (
					<Button
						key={folder.id}
						variant="outline"
						className="h-32 w-full flex flex-col items-center justify-center gap-2"
						onClick={() => onFolderClick(folder.id)}
					>
						<FolderIcon className="h-8 w-8" />
						<span>{folder.name}</span>
						<span className="text-xs text-muted-foreground">
							{folder.files.length} files
						</span>
					</Button>
				))}
			</div>
		</div>
	);
}
