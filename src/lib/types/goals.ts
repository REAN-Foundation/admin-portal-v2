export interface GoalsCreateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
	TenantId?: string;
}

export interface GoalsUpdateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
	TenantId?: string;
}
