export interface WebNewsfeedsCreateModel {
	Name: string;
	Description: string;
	PathUrl: string;
	Tags?: string[];
	Version: string;
}

export interface WebNewsfeedsUpdateModel {
	Name: string;
	Description: string;
	PathUrl: string;
	Tags?: string[];
	Version: string;
}
