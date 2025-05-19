export interface MedicationCreateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
}

export interface MedicationUpdateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
}
