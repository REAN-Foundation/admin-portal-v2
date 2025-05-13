export interface PromptTemplateCreateModel {
    Name: string;
    Description:string;
    Content:string;
    Type:string;
    Category:string;
    SubGroup:string;
    Variables:string[];
    Version:number;
}

export interface PromptTemplateUpdateModel {
    Name: string;
    Description:string;
    Content:string;
    Type:string;
    Category:string;
    SubGroup:string;
    Variables:string[];
    Version:number;
}
