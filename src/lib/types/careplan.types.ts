export interface CarePlanCreateModel {
    Name: string;
    Tags?: string[];
    Code?: string;
    CategoryId: string;
    Description?: string;
    Version?: string;
    OwnerUserId: string;
    TenantId?: string;
}

export interface CarePlanUpdateModel {
    Name?: string;
    Tags?: string[];
    Code?: string;
    CategoryId?: string;
    Description?: string;
    Version?: string;
    OwnerUserId: string;
    TenantId?: string;
}