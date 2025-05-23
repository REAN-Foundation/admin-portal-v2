export interface MeditationCreateModel {
  Name: string;
  Description?: string;
  MeditationType?: string;
  RecommendedDurationMin?: number;
  Tags?: string[];
  Version?: string;
}

export interface MeditationUpdateModel {
  Name: string;
  Description?: string;
  MeditationType?: string;
  RecommendedDurationMin?: number;
  Tags?: string[];
  Version?: string;
}
