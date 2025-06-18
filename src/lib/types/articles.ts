export interface ArticlesCreateModel {
	Name: string;
	Summary: string;
	PathUrl: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;
}

export interface ArticlesUpdateModel {
	Name: string;
	Summary: string;
	PathUrl: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;
}
