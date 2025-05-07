export interface AnimationsCreateModel {
	Name: string;
	Transcript: string;
	PathUrl: string;
	Tags?: string[];
	Version: string;
}

export interface AnimationsUpdateModel {
	Name: string;
	Transcript: string;
	PathUrl: string;
	Tags?: string[];
	Version: string;
}
