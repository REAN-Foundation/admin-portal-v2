export interface MessageCreateModel {
	Name: string;
	Description?: string;
    MessageType?: string;
    TemplateName?: string;
	TemplateVariables?: { [key: string]: any };
	PathUrl?: string;
	Tags?: string[];
	Version?: string;
	TenantId?: string;
}

export interface MessageUpdateModel {
	Name: string;
	Description?: string;
    MessageType?: string;
    TemplateName?: string;
	TemplateVariables?: { [key: string]: any };
	PathUrl?: string;
	Tags?: string[];
	Version?: string;
	TenantId?: string;
}
