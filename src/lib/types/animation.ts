export interface AnimationsCreateModel {
	Name: string;
	Transcript: string;
	PathUrl: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;
}

export interface AnimationsUpdateModel {
	Name: string;
	Transcript: string;
	PathUrl: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;
}
