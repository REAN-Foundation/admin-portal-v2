export interface PageServerData {
	childNodes: Array<{
		id: string;
		Title: string;
		DisplayCode?: string;
		ParentNodeId: string;
	}>;
	sessionId: string;
	message: string;
	title: string;
	optionData?: {
		id: string;
		Text: string;
		Sequence: number;
		NodeId: string;
	};
} 