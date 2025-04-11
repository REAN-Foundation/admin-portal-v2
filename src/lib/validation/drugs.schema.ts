import { z } from "zod";

export const updateDrugSchema = z.object({
    drugName: z.string().max(128),
    genericName: z.string().optional(),
    ingredients: z.string().optional(),
    strength: z.string().optional(),
    otherCommercialNames: z.string().optional(),
    manufacturer: z.string().optional(),
    otherInformation: z.string().optional()
});
