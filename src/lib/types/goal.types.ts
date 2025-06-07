export interface GoalTypeCreateModel {
    Type: string;
    Tags?: string[];
    TenantId?: string;
}

export interface GoalTypeUpdateModel {
    Type: string;
    Tags?: string[];
    TenantId?: string;
}
