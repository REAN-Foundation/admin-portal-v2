export interface InfographicsCreateModel {
	Name: string;
	Description?: string;
	PathUrl?: string;
	Tags?: string[];
	Version?: string;
}

export interface InfographicsUpdateModel {
	Name: string;
	Description?: string;
	PathUrl?: string;
	Tags?: string[];
	Version?: string;
}
