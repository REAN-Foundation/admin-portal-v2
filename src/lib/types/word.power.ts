export interface WordPowerCreateModel {
	Name: string;
	Description: string;
	AdditionalResources: string[];
	Tags?: string[];
	Version: string;
}

export interface WordPowerUpdateModel {
	Name: string;
	Description: string;
	AdditionalResources: string[];
	Tags?: string[];
	Version: string;
}
