export interface ReflectionCreateModel {
	Name: string;
	Description: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;
}

export interface ReflectionUpdateModel {
	Name: string;
	Description: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;
}
