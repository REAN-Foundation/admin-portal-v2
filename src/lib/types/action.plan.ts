export interface ActionPlanCreateModel {
	Name: string;
	Description: string;
	Tags?: string[];
	Version: string;
}

export interface ActionPlanUpdateModel {
	Name: string;
	Description: string;
	Tags?: string[];
	Version: string;
}
