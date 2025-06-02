export interface RemindersCreateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
}

export interface RemindersUpdateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
}
