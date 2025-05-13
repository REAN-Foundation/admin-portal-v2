export interface AssessmentCreateModel {
    Name: string;
    Description?: string;
    Template?: string;
    ReferenceTemplateCode?: string;
    Tags?: string[];
    Version?: string;
}

export interface AssessmentUpdateModel {
    Name: string;
    Description?: string;
    Template?: string;
    TemplateCode?: string;
    Tags?: string[];
    Version?: string;
}
