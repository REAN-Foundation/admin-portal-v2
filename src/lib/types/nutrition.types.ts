export interface NutritionCreateModel {
	Name: string;
	Description: string;
	Tags?: string[];
	Version: string;
}

export interface NutritionUpdateModel {
	Name: string;
	Description: string;
	Tags?: string[];
	Version: string;
}
