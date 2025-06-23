import { z } from "zod";

export const createOrUpdateSchema = z.object({
    Name: z
        .string({
            required_error: 'Challenge name is required.',
            invalid_type_error: 'Challenge name must be a string.',
        })
        .min(1, { message: 'Challenge name cannot be empty.' })
        .max(128, { message: 'Challenge name must be at most 128 characters long.' }),

    Description: z
            .string()
            .max(1024, { message: 'Description must be at most 1024 characters long.' })
            .optional(),

    Tags: z.array(z.string()).optional(),

    Version: z
        .string({
            invalid_type_error: 'Version must be a string.',
        })
        .optional(),
    TenantId: z
		.string({
			required_error: 'TenantId is required.',
			invalid_type_error: 'TenantId must be a string.'
		})
});
