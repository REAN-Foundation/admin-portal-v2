export interface CheckupsCreateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
	TenantId?: string;
}

export interface CheckupsUpdateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
	TenantId?: string;
}
