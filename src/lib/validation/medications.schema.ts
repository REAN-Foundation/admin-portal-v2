import { z } from "zod";

export const createOrUpdateSchema = z.object({
    Name: z
        .string({
            required_error: 'Medication name is required.',
            invalid_type_error: 'Medication name must be a string.',
        })
        .min(1, { message: 'Medication name cannot be empty.' })
        .max(128, { message: 'Medication name must be at most 128 characters long.' }),

    Description: z
        .string({
            invalid_type_error: 'Description must be a string.',
        })
        .optional(),

    Tags: z.array(z.string()).optional(),

    Version: z
        .string({
            invalid_type_error: 'Version must be a string.',
        })
        .optional(),
});
