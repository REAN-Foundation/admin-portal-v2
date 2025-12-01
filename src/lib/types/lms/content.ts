export interface ContentCreateModel {
	CourseModuleId?: string;
	Title: string;
	Description?: string;
	Sequence?: number;
	ContentType: string;
	ResourceLink?: string;
	ImageUrl?: string;
	DurationInMins?: number;
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

