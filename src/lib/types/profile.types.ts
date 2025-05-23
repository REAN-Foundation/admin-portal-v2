export interface ProfileUpdateModel {
	FirstName: string;
	LastName: string;
	Phone: string;
	CountryCode:string;
	Email: string;
	RoleId: number;
	Role: string;
    ResourceId:string;
}


export interface ProfileFileUploadModel {
	UploadFile: File;
	FileName: string;
	FileType: string;
}
