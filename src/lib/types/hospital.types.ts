export interface HospitalCreateModel {
	Name: string;
	HealthSystemId?: string;
	Tags?: string[];
}

export interface HospitalUpdateModel {
	Name: string;
	HealthSystemId?: string;
	Tags?: string[];
}
