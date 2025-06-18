export interface PhysiotherapyCreateModel {
  Name: string;
  Description?: string;
  RecommendedDurationMin?: number;
  Tags?: string[];
  Version?: string;
  TenantId?: string;
}

export interface PhysiotherapyUpdateModel {
  Name: string;
  Description?: string;
  RecommendedDurationMin?: number;
  Tags?: string[];
  Version?: string;
  TenantId?: string;
}
