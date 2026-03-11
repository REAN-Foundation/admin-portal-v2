export interface SplitterOption {
	label: string;
	value: string;
}

export const splitterOptionsByType: Record<string, SplitterOption[]> = {
	csv: [
		{ label: '--- (Triple Dash)', value: '---' },
		{ label: '\\n\\n (Double Newline)', value: '\n\n' },
		{ label: '\\n (Line Break)', value: '\n' },
	],
	xlsx: [
		{ label: '--- (Triple Dash)', value: '---' },
		{ label: '\\n\\n (Double Newline)', value: '\n\n' },
		{ label: '\\n (Line Break)', value: '\n' },
	],
	pdf: [
		{ label: '--- (Triple Dash)', value: '---' },
		{ label: '*** (Triple Asterisk)', value: '***' },
		{ label: '### (Triple Hash)', value: '###' },
		{ label: '\\n\\n (Double Newline)', value: '\n\n' },
		{ label: 'Paragraph', value: 'Paragraph' },
		{ label: '\\n (Line Break)', value: '\n' },
	],
	json: [
		{ label: '--- (Triple Dash)', value: '---' },
		{ label: '\\n\\n (Double Newline)', value: '\n\n' },
		{ label: '\\n (Line Break)', value: '\n' },
	],
	txt: [
		{ label: '--- (Triple Dash)', value: '---' },
		{ label: '*** (Triple Asterisk)', value: '***' },
		{ label: '### (Triple Hash)', value: '###' },
		{ label: '\\n\\n (Double Newline)', value: '\n\n' },
		{ label: 'Paragraph', value: 'Paragraph' },
		{ label: '\\n (Line Break)', value: '\n' },
	],
};

export interface DocumentsCreateModel {
	Name: string;
	Description: string;
	FileName: string;
	Source: string;
	ParentDocument: string;
	Active: boolean;
    TenantId?: string;
    TenantCode?: string;
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
