import { NotificationChannel } from './notification.channel';

export type GenericChannelConfig = Record<string, any>;

export interface WhatsAppConfig {
    TemplateName?: string;
    TemplateLanguage?: string;
    FlowToken?: string;
    FlowActionData?: Record<string, any>;
}

export type ChannelConfigs = {
    [NotificationChannel.WhatsApp]?: WhatsAppConfig;
    [NotificationChannel.Telegram]?: GenericChannelConfig;
    [NotificationChannel.Email]?: GenericChannelConfig;
    [NotificationChannel.SMS]?: GenericChannelConfig;
    [NotificationChannel.WebPush]?: GenericChannelConfig;
    [NotificationChannel.MobilePush]?: GenericChannelConfig;
    [NotificationChannel.Webhook]?: GenericChannelConfig;
    [NotificationChannel.Slack]?: GenericChannelConfig;
    [NotificationChannel.WhatsappWati]?: GenericChannelConfig;
    [NotificationChannel.WhatsappMeta]?: GenericChannelConfig;
};

export interface Metadata {
    Type: string;
    Channels?: ChannelConfigs;
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

export interface AssessmentNodeOption {
    DisplayCode: string;
    ProviderGivenCode: string;
    Text: string;
    Sequence: number;
  }
  
  export interface AssessmentNode {
    DisplayCode: string;
    NodeType: string;
    ProviderGivenId?: string;
    ProviderGivenCode?: string;
    Title: string;
    Description?: string | null;
    Sequence?: number;
    QueryResponseType?: string;
    Options?: AssessmentNodeOption[];
    ChildrenNodeDisplayCodes?: string[];
  }
  
  export interface AssessmentTemplate {
    DisplayCode: string;
    Version: string;
    Type: string;
    Title: string;
    Provider: string;
    ProviderAssessmentCode?: string;
    RootNodeDisplayCode?: string;
    Nodes: AssessmentNode[];
  }
  