export interface AssessmentPathCreateModel {
	TemplateId: string;
	NodeId: string;
	MessageBeforeQuestion?: string;
	IsExitPath: boolean;
	NextNodeId: string;
	NextNodeDisplayCode?: string;
}

export interface AssessmentPathUpdateModel {
	MessageBeforeQuestion?: string;
	IsExitPath?: boolean;
	NextNodeId?: string;
	DisplayCode?: string;
	ConditionId?: string;
}

export interface AssessmentPath {
	Id: string;
	TemplateId: string;
	NodeId: string;
	OptionId: string;
	Options: string;
	MessageBeforeQuestion?: string;
	IsExitPath: boolean;
	NextNode: string;
	NextNodeDisplayCode?: string;
	CreatedAt: string;
	UpdatedAt: string;
} 