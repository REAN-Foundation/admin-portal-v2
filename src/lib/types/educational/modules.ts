export interface ModuleCreateModel {
	Name: string;
	Description?: string;
	DurationInMins?: number;
	ImageUrl?: string;
	Sequence?: number;
}

export interface ModuleUpdateModel {
	Name: string;
	Description?: string;
	DurationInMins?: number;
	ImageUrl?: string;
	Sequence?: number;
}

