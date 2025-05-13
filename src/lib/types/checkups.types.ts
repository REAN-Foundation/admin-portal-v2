export interface CheckupsCreateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
}

export interface CheckupsUpdateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
}
