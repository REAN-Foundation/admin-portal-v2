export interface PhysiotherapyCreateModel {
  Name: string;
  Description?: string;
  RecommendedDurationMin?: number;
  Tags?: string[];
  Version?: string;
}

export interface PhysiotherapyUpdateModel {
  Name: string;
  Description?: string;
  RecommendedDurationMin?: number;
  Tags?: string[];
  Version?: string;
}
