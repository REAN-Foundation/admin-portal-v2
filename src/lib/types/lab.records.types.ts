export interface LabRecordCreateModel {
    TypeName: string;
    DisplayName: string;
    SnowmedCode: string;
    LoincCode: string;
    NormalRangeMin: number;
    NormalRangeMax: number;
    Unit: string;
}

export interface LabRecordUpdateModel {
    TypeName: string;
    DisplayName: string;
    SnowmedCode: string;
    LoincCode: string;
    NormalRangeMin: number;
    NormalRangeMax: number;
    Unit: string;
}
