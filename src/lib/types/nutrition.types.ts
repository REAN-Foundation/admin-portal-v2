export interface NutritionCreateModel {
	Name: string;
	Description: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;
}

export interface NutritionUpdateModel {
	Name: string;
	Description?: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;
}
