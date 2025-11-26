export interface ModuleCreateModel {
	Name: string;
	Description?: string;
	DurationInMins?: number;
	ImageUrl?: string;
	Sequence?: number;
	CourseId?: string;
	learningPathId?: string;
}

export interface ModuleUpdateModel {
	Name: string;
	Description?: string;
	DurationInMins?: number;
	ImageUrl?: string;
	Sequence?: number;
}

