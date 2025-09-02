import { z } from "zod";
import { zfd } from "zod-form-data";

export const createOrUpdateSchema = zfd.formData({
    TypeName: z
        .string({
            required_error: "Type Name is required.",
            invalid_type_error: "Type Name must be a string.",
        })
        .min(8, { message: "Type Name must be at least 8 characters." })
        .max(128, { message: "Type Name must be at most 128 characters long." }),

    DisplayName: z
        .string()
        .max(256, { message: "Display Name must be at most 256 characters long." })
        .optional(),

    SnowmedCode: z
        .string()
        .max(128, { message: "Snowmed Code must be at most 128 characters long." })
        .optional(),

    LoincCode: z
        .string()
        .max(128, { message: "Loinc Code must be at most 128 characters long." })
        .optional(),

    NormalRangeMin: zfd
        .numeric(
            z
                .number()
                .nonnegative({ message: "Normal Range Min must be a positive number." })
                .optional()
        ),

    NormalRangeMax: zfd
        .numeric(
            z
                .number()
                .nonnegative({ message: "Normal Range Max must be a positive number." })
                .optional()
        ),

    Unit: z
        .string()
        .max(64, { message: "Unit must be at most 64 characters long." })
        .optional()
});
