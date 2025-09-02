export interface AssessmentCreateModel {
    Name: string;
    Description?: string;
    Template?: string;
    ReferenceTemplateCode?: string;
    Tags?: string[];
    Version?: string;
    TenantId?: string;
}

export interface AssessmentUpdateModel {
    Name: string;
    Description?: string;
    Template?: string;
    ReferenceTemplateCode?: string;
    Tags?: string[];
    Version?: string;
    TenantId?: string;
}
