export interface LearningPathCreateModel {
	TenantId: string;
	Name: string;
	Description?: string;
	ImageUrl?: string;
	DurationInDays?: number;
	PreferenceWeight?: number;
	Enabled?: boolean;
	CourseIds?: string[];
}

export interface LearningPathUpdateModel {
	TenantId: string;
	Name: string;
	Description?: string;
	ImageUrl?: string;
	DurationInDays?: number;
	PreferenceWeight?: number;
	Enabled?: boolean;
	CourseIds?: string[];
}