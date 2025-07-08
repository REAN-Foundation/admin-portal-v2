import { z } from "zod";

export const createOrUpdateSchema = z.object({
    DrugName: z
        .string({
            required_error: "Drug name is required.",
            invalid_type_error: "Drug name must be a string."
        })
        .min(3, { message: "Drug name must be 3 characters long." })
        .max(128, { message: "Drug name must be at most 128 characters long." }),

    GenericName: z
        .string()
        .max(128, { message: "Generic name must be at most 128 characters long." })
        .optional(),

    Ingredients: z
        .string()
        .max(512, { message: "Ingredients must be at most 512 characters long." })
        .optional(),

    Strength: z
        .string()
        .max(128, { message: "Strength must be at most 128 characters long." })
        .optional(),

    OtherCommercialNames: z
        .string()
        .max(256, { message: "Other commercial names must be at most 256 characters long." })
        .optional(),

    Manufacturer: z
        .string()
        .max(256, { message: "Manufacturer must be at most 256 characters long." })
        .optional(),

    OtherInformation: z
        .string()
        .max(1024, { message: "Other information must be at most 1024 characters long." })
        .optional()
});
