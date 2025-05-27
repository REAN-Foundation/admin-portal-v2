export interface CarePlanSchedulingCreateModel {
    AssetType: string;
    AssetId: string;
    ScheduleDay: number;
    TimeSlot: string;
}

export interface CarePlanSchedulingUpdateModel {
    AssetType?: string;
    AssetId?: string;
    ScheduleDay?: number;
    TimeSlot?: string;
}