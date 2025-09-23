export interface Metadata {
    Type: string;
    TemplateName: string;
    TemplateLanguage?: string;
    FlowToken?: string;
    FlowActionData?: Record<string, any>;
}

export interface AssessmentCreateModel {
    Name: string;
    Description?: string;
    Template?: string;
    ReferenceTemplateCode?: string;
    Tags?: string[];
    Version?: string;
    TenantId?: string;
    Metadata?: Metadata;
}

export interface AssessmentUpdateModel {
    Name: string;
    Description?: string;
    Template?: string;
    ReferenceTemplateCode?: string;
    Tags?: string[];
    Version?: string;
    TenantId?: string;
    Metadata?: Metadata;
}
