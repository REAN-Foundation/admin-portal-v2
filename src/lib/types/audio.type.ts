export interface AudioCreateModel {
	Name: string;
	Transcript?: string;
	PathUrl?: string;
	Tags?: string[];
	Version?: string;
}

export interface AudioUpdateModel {
	Name: string;
	Transcript?: string;
	PathUrl?: string;
	Tags?: string[];
	Version?: string;
}
