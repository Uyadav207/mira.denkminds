export interface Folder {
	id: string;
	name: string;
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
