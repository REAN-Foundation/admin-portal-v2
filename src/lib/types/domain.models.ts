export interface LoginModel {
	UserName?: string;
	Email?: string;
	CountryCode?: string;
	Phone?: string;
	Password?: string;
	LoginRoleId?: number;
}

export interface ResponseData {
	Success: boolean;
	Message: string;
	Data?: unknown;
}

export interface PersonRole {
	id: number;
	RoleName: string;
	// Description?: string;
}

export interface OrganizationTypes {
	organizationTypes: string;
}
