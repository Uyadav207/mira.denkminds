import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "../ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";

interface CreateFolderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateFolder: (name: string) => void;
}

export function CreateFolderDialog({
	open,
	onOpenChange,
	onCreateFolder,
}: CreateFolderDialogProps) {
	const [folderName, setFolderName] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onCreateFolder(folderName);
		setFolderName("");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Folder</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<label htmlFor="name">Folder Name</label>
							<Input
								id="name"
								value={folderName}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setFolderName(e.target.value)
								}
								placeholder="Enter folder name"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={!folderName}>
							Create Folder
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
