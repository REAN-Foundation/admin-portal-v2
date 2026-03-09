export interface KnowledgeNuggetsCreateModel {
	Name: string;
	BriefInformation?: string | null;
	DetailedInformation?: string | null;
	AdditionalResources?: string[] | null;
	Tags?: string[] | null;
}

export interface KnowledgeNuggetsUpdateModel {
	Name: string;
	BriefInformation?: string | null;
	DetailedInformation?: string | null;
	AdditionalResources?: string[] | null;
	Tags?: string[] | null;
}
