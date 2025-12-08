export interface ModuleCreateModel {
	Name: string;
	Description?: string;
	DurationInMins?: number;
	ImageUrl?: string;
	// ContentSequence?: number;
	CourseId?: string;
}

export interface ModuleUpdateModel {
	Name: string;
	Description?: string;
	DurationInMins?: number;
	ImageUrl?: string;
	// ContentSequence?: number;
}

