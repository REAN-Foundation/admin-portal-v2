export interface InfographicsCreateModel {
	Name: string;
	Description?: string;
	Url?: string;
	Tags?: string[];
	Version?: string;
}

export interface InfographicsUpdateModel {
	Name: string;
	Description?: string;
	Url?: string;
	Tags?: string[];
	Version?: string;
}
