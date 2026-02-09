import { z } from "zod";
import { zfd } from "zod-form-data";

export const createOrUpdateSchema = zfd
    .formData({
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
                    .number({
                        invalid_type_error: "Normal Range Min must be a valid number.",
                    })
                    .nonnegative({ message: "Normal Range Min cannot be negative." })
                    .optional()
            ),

        NormalRangeMax: zfd
            .numeric(
                z
                    .number({
                        invalid_type_error: "Normal Range Max must be a valid number.",
                    })
                    .nonnegative({ message: "Normal Range Max cannot be negative." })
                    .optional()
            ),

        Unit: z
            .string()
            .max(64, { message: "Unit must be at most 64 characters long." })
            .optional()
    })
 .refine(
    (data) => {
        const min = data.NormalRangeMin;
        const max = data.NormalRangeMax;

        // Skip the check when both are default (0, 0)
        if (min === 0 && max === 0) {
            return true;
        }

        // If both values are provided, ensure Min < Max
        if (min !== undefined && max !== undefined) {
            return min < max;
        }

        return true;
    },
    {
        message: "Minimum Normal Range must be less than Maximum Normal Range.",
        path: ["NormalRangeMin"]
    }
)
    