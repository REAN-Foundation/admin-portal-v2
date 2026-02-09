export interface TenantsCreateModel {
    Name: string;
    Description: string;
    Code: string;
    Email: string;
    Phone: string;
    Username: string;
    Password: string;
}

export interface TenantsUpdateModel {
    Name: string;
    Description: string;
    Code: string;
    Email: string;
    Phone: string;
}

export enum PromotionEnvironment {
    Development = 'development',
    UAT = 'uat',
    Production = 'production'
}
