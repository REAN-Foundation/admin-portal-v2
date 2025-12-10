export interface CourseCreateModel {
	Name: string;
	Description?: string;
	ImageResourceId?: string;
	DurationInDays?: number;
	TenantId?: string;
	// Sequence?: number;
}

export interface CourseUpdateModel {
	Name: string;
	Description?: string;
	ImageResourceId: string;
	DurationInDays?: number;
	TenantId?: string;
	// Sequence?: number;
}

export interface CourseImageUploadModel {
    UploadFile: File;
    FileName: string;
    FileType: string;
}

