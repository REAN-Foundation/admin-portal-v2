export interface CourseCreateModel {
	Name: string;
	Description?: string;
	ImageResourceId: string;
	DurationInDays?: number;
	TenantId?: string;
}

export interface CourseUpdateModel {
	Name: string;
	Description?: string;
	ImageResourceId: string;
	DurationInDays?: number;
}

export interface CourseImageUploadModel {
    UploadFile: File;
    FileName: string;
    FileType: string;
}

