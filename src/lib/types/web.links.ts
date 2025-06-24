export interface WebLinksCreateModel {
	Name: string;
	Description: string;
	PathUrl: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;

}

export interface WebLinksUpdateModel {
	Name: string;
	Description?: string;
	PathUrl?: string;
	Tags?: string[];
	Version: string;
	TenantId?: string;
}
