export interface WebNewsfeedsCreateModel {
	Name: string;
	Description: string;
	PathUrl: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;
}

export interface WebNewsfeedsUpdateModel {
	Name: string;
	Description?: string;
	PathUrl?: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;
}
