export interface CarePlanCreateModel {
    Name: string;
    Tags?: string[];
    Code?: string;
    CategoryId: string;
    Description?: string;
    Version?: string;
}

export interface CarePlanUpdateModel {
    Name?: string;
    Tags?: string[];
    Code?: string;
    Category?: string;
    Description?: string;
    Version?: string;
}