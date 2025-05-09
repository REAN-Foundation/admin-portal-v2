export interface AssessmentNodeCreateModel {
    NodeType: string;
    ParentNodeId: string;
    Title: string;
    Description?: string;
    Sequence: number;
    QueryType: string;
    ResolutionScore: number;
    ProviderAssessmentCode: string;
    Message?: string;
    ServeListNodeChildrenAtOnce: boolean;
    ScoringApplicable: boolean;
    Options: string[];
    Tags: string[];
    CorrectAnswer?: string;
};

export interface AssessmentNodeUpdateModel {
    NodeType?: string;
    ParentNodeId?: string;
    Title?: string;
    Description?: string;
    Sequence?: number;
    QueryType?: string;
    ResolutionScore?: number;
    ProviderAssessmentCode?: string;
    Message?: string;
    ServeListNodeChildrenAtOnce?: boolean;
    ScoringApplicable?: boolean;
    Options?: string[];
    Tags?: string[];
    CorrectAnswer?: string;
};