export interface FollowUpUploadModel {
    File: File;
}

export interface ScheduleAppointmentModel {
    Date: string;
}

export interface AppointmentCancelModel {
    Dates: string[];
    Message?: string;
}