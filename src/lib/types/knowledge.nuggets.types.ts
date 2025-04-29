export interface KnowledgeNuggetsCreateModel {
	Name: string;
	BriefInformation: string;
    DetailedInformation: string;
    AdditionalResources?:string[];
	Tags?: string[];
}

export interface KnowledgeNuggetsUpdateModel {
	Name: string;
    BriefInformation: string;
    DetailedInformation: string;
    AdditionalResources?:string[];
	Tags?: string[];
}
