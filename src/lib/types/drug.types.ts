export interface DrugCreateModel {
    DrugName: string;
    GenericName: string;
    Ingredients: string;
    Strength: string;
    OtherCommercialNames: string;
    Manufacturer: string;
    OtherInformation: string;
}

export interface DrugUpdateModel {
    DrugName?: string;
    GenericName?: string;
    Ingredients?: string;
    Strength?: string;
    OtherCommercialNames?: string;
    Manufacturer?: string;
    OtherInformation?: string;
}