export interface InfographicsCreateModel {
	Name: string;
	Description?: string;
	Url?: string;
	Tags?: string[];
	Version?: string;
	TenantId?: string;
}

export interface InfographicsUpdateModel {
	Name: string;
	Description?: string;
	Url?: string;
	Tags?: string[];
	Version?: string;
	TenantId?: string;
}
