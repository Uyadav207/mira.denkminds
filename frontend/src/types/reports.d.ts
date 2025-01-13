export interface Folder {
	_id: string;
	folderName: string;
	files: File[];
	createdAt: Date;
}

export interface File {
	_id: string;
	_creationTime: number;
	createdAt: number;
	fileName: string;
	fileUrl: string;
	folderId: string;
	markdownContent: string;
	userId?: string; // Optional field
}

export interface FolderType {
	_id: string;
	folderName: string;
	type: "folder";
}

export interface FolderItem {
	id: string;
	name: string;
	type: string;
}

export interface ConvexFolderType {
	_id: string;
	folderName: string;
	type: "folder";
	userId?: string;
}
