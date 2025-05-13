export interface BiometricsCreateModel {
    Name: string;
    Description?: string;
    BiometricsType?: string;
    MeasurementUnit?: string;
    Tags?: string[];
    Version?: string;
}

export interface BiometricsUpdateModel {
    Name: string;
    Description?: string;
    BiometricsType?: string;
    MeasurementUnit?: string;
    Tags?: string[];
    Version?: string;
}
