export interface ChallengesCreateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
	TenantId?: string;
}

export interface ChallengesUpdateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
	TenantId?: string;
}
