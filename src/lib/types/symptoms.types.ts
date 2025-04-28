export interface SymptomCreateModel {
    Symptom: string;
    Description: string;
    Tags?: string[];
    Language: string;
    ImageResourceId: string;
}

export interface SymptomUpdateModel {
    Symptom?: string;
    Description?: string;
    Tags?: string[];
    Language?: string;
    ImageResourceId?: string;
}
