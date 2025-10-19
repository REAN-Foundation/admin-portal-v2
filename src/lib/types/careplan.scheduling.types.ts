export interface CarePlanSchedulingCreateModel {
    AssetType: string;
    AssetId: string;
    ScheduleDay: number;
    TimeSlot: string;
    Sequence?: number;
}

export interface CarePlanSchedulingUpdateModel {
    AssetType?: string;
    AssetId?: string;
    ScheduleDay?: number;
    TimeSlot?: string;
    Sequence?: number;
}