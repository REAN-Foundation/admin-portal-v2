export interface MedicationCreateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
	TenantId?: string;
}

export interface MedicationUpdateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
	TenantId?: string;
}
