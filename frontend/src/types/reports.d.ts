export interface Folder {
	_id: string;
	folderName: string;
	files: File[];
	createdAt: Date;
}

export interface File {
	id: string;
	name: string;
	url: string;
	createdAt: Date;
	type: "pdf";
	size: number;
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
