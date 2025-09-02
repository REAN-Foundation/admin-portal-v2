export interface ActionPlanCreateModel {
	Name: string;
	Description: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;
}

export interface ActionPlanUpdateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;
}
