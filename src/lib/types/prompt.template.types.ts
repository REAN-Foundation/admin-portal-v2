export interface PromptTemplateCreateModel {
    Name: string;
    Description?: string;
    Model: string;
    Prompt: string;
    UseCaseType: string;
    Group: string;
    Variables?: string[];
    Temperature: number;
    TopP: number;
    FrequencyPenalty: number;
    PresencePenalty: number;
}
export interface PromptTemplateUpdateModel {
    Name: string;
    Description?: string;
    Model: string;
    Prompt: string;
    UseCaseType: string;
    Group: string;
    Variables?: string[];
    Temperature?: number;
    TopP?: number;
    FrequencyPenalty?: number;
    PresencePenalty?: number;
}