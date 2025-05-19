export interface DocumentsCreateModel {
	Name: string;
	Description: string;
	FileName: string;
	Source: string;
	ParentDocument: string;
	Version: string;
	Active: boolean;
	CreatedBy: string;
	ChunkingStratergy: string;
	ChunkingLength: number;
	ChunkingOverlap: number;
	Splitter: string;
	ResourceId: string;
	Keywords: string[];
	DocumentType: string;
}

export interface DocumentsUpdateModel {
	Name: string;
	Description: string;
	FileName: string;
	Source: string;
	ParentDocument: string;
	Version: string;
	Active: boolean;
	CreatedBy: string;
	ChunkingStratergy: string;
	ChunkingLength: number;
	ChunkingOverlap: number;
	Splitter: string;
	ResourceId: string;
	Keywords: string[];
	DocumentType: string;
}
