export interface AppointmentCreateModel {
	Name: string;
	Description: string;
	AppointmentType: string;
	Tags?: string[];
	Version: string;
}

export interface AppointmentUpdateModel {
	Name: string;
	Description: string;
	AppointmentType: string;
	Tags?: string[];
	Version: string;
}
