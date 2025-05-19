export interface PriorityCreateModel {
	Name: string;
	Description: string;
	Tags?: string[];
	Version: string;
}

export interface PriorityUpdateModel {
	Name: string;
	Description: string;
	Tags?: string[];
	Version: string;
}
