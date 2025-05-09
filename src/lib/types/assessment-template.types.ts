export interface AssessmentTemplateCreateModel {
    Title: string;
    Description?: string;
    Type: string;
    Provider: string;
    ProviderAssessmentCode: string;
    ServeListNodeChildrenAtOnce: boolean;
    ScoringApplicable: boolean;
    Tags?: string[];
};

export interface AssessmentTemplateUpdateModel {
    Title?: string;
    Description?: string;
    Type?: string;
    Provider?: string;
    ProviderAssessmentCode?: string;
    ServeListNodeChildrenAtOnce?: boolean;
    ScoringApplicable?: boolean;
    Tags?: string[];
};