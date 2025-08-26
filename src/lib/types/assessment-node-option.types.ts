export interface AssessmentNodeOptionCreateModel {
    Text: string;
    Sequence: number;
    ProviderGivenCode?: string;
};

export interface AssessmentNodeOptionUpdateModel {
    Text: string;
    Sequence?: number;
    ProviderGivenCode?: string;
};