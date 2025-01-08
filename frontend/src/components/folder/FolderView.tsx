import { useState } from "react";
import {
	FileIcon,
	UploadIcon,
	DownloadIcon,
	Eye,
	ArrowLeft,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@components/ui/dialog";
import type { Folder, File } from "../../types/reports";

interface FolderViewProps {
	folder: Folder;
	onUploadFile: (folderId: string, file: File) => void;
	onBack: () => void;
}

export function FolderView({ folder, onUploadFile, onBack }: FolderViewProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const newFile: File = {
				id: crypto.randomUUID(),
				name: file.name,
				url: URL.createObjectURL(file),
				createdAt: new Date(),
				type: "pdf",
				size: file.size,
			};
			onUploadFile(folder._id, newFile);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 items-start">
				<Button variant="outline" onClick={onBack} className="w-auto">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Folders
				</Button>
				<h2 className="text-2xl font-bold">{folder.folderName}</h2>
			</div>
			<div className="flex items-center gap-4">
				<Input
					type="file"
					accept=".pdf"
					onChange={handleFileUpload}
					className="hidden"
					id="file-upload"
				/>
				<label htmlFor="file-upload">
					<Button asChild>
						<span>
							<UploadIcon className="mr-2 h-4 w-4" />
							Upload PDF
						</span>
					</Button>
				</label>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{folder.files.map((file, index) => (
					<div
						key={`${file.id}-${index}`}
						className="flex flex-col border rounded-lg p-4"
					>
						<FileIcon className="h-16 w-16 text-blue-500 mx-auto" />
						<h3 className="mt-2 font-semibold text-center">
							{file.name}
						</h3>
						<p className="text-sm text-muted-foreground text-center">
							{(file.size / 1024 / 1024).toFixed(2)} MB
						</p>
						<div className="flex mt-4 space-x-2 justify-center">
							<Button
								size="sm"
								variant="outline"
								onClick={() => window.open(file.url, "_blank")}
							>
								<DownloadIcon className="mr-2 h-4 w-4" />
								Download
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => setSelectedFile(file)}
							>
								<Eye className="mr-2 h-4 w-4" />
								View
							</Button>
						</div>
					</div>
				))}
			</div>
			<Dialog
				open={!!selectedFile}
				onOpenChange={() => setSelectedFile(null)}
			>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>{selectedFile?.name}</DialogTitle>
					</DialogHeader>
					<div className="aspect-video">
						<iframe
							src={selectedFile?.url}
							title={selectedFile?.name}
							width="100%"
							height="100%"
							style={{ border: "none" }}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
