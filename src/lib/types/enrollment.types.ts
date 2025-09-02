export interface EnrollmentCreateModel {
    PatientUserId: string;
    PlanName: string;
    PlanCode: string;
    Channel?: string;
    NumberOfDays?: number;
    StartHour?: number;
    StartMinutes?: number;
    IntervalMinutes?: number;
    StartFromTomorrow?: boolean;
}
