export type ProgressStatus = string;

export interface UpdateUserLearningModel {
	UserId: string;
	ContentId: string;
	LearningPathId?: string | null;
	CourseId?: string | null;
	ModuleId?: string | null;
	ProgressStatus?: ProgressStatus | null;
}

export interface UserLearningPathSummary {
	id: string;
	Name?: string;
	Description?: string;
	ProgressPercent?: number;
	CompletionPercent?: number;
}

export interface UserCourseSummary {
	id: string;
	Name?: string;
	Description?: string;
	ProgressPercent?: number;
	CompletionPercent?: number;
}

export interface ProgressResponse {
	ProgressPercent?: number;
	Percentage?: number;
	Progress?: number;
}

export interface CompletionStateResponse {
	// Backend-specific; typically includes counts/percent + status for children.
	ProgressStatus?: ProgressStatus;
	CompletedCount?: number;
	TotalCount?: number;
	CompletionPercent?: number;
}





