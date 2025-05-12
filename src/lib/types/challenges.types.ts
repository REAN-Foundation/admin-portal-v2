export interface ChallengesCreateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
}

export interface ChallengesUpdateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version?: string;
}
