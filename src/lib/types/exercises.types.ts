export interface ExerciseCreateModel {
  Name: string;
  Description?: string;
  ExerciseType?: string;
  IntensityLevel?: string;
  RecommendedDurationMin?: number;
  Tags?: string[];
  Version?: string;
  TenantId?: string;
}

export interface ExerciseUpdateModel {
  Name: string;
  Description?: string;
  ExerciseType?: string;
  IntensityLevel?: string;
  RecommendedDurationMin?: number;
  Tags?: string[];
  Version?: string;
  TenantId?: string;
}
