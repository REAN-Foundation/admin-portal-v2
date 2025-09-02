export interface VideoCreateModel {
	Name: string;
	Transcript: string;
	PathUrl: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;
}

export interface VideoUpdateModel {
	Name: string;
	Transcript?: string;
	PathUrl?: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;
}
