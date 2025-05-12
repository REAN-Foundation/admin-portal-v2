export interface ConsultationCreateModel {
    Name: string;
    Description?: string;
    ConsultationType?: string;
    Tags?: string[];
    Version?: string;
}

export interface ConsultationUpdateModel {
    Name: string;
    Description?: string;
    ConsultationType?: string;
    Tags?: string[];
    Version?: string;
}
