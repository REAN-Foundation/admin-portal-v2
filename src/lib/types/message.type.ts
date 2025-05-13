export interface MessageCreateModel {
	Name: string;
	Description?: string;
    MessageType?: string;
    TemplateName?: string;
	PathUrl?: string;
	Tags?: string[];
	Version?: string;
}

export interface MessageUpdateModel {
	Name: string;
	Description?: string;
    MessageType?: string;
    TemplateName?: string;
	PathUrl?: string;
	Tags?: string[];
	Version?: string;
}
