export interface ContentCreateModel {
	ModuleId?: string;
	Title: string;
	Description?: string;
	Sequence?: number;
	ContentType: string;
	ResourceLink?: string;
	ImageUrl?: string;
	DurationInMins?: number;
	learningPathId?: string;
	// ActionTemplateId: string;
}

export interface ContentUpdateModel {
	Title: string;
	Description?: string;
	Sequence?: number;
	ContentType: string;
	ResourceLink?: string;
	ImageUrl?: string;
	DurationInMins?: number;
}

