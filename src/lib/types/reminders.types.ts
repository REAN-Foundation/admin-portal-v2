export interface RemindersCreateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
	TenantId?: string;
}

export interface RemindersUpdateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
	TenantId?: string;
}
