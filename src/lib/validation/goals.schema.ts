import { z } from "zod";

export const createOrUpdateSchema = z.object({
    Name: z
        .string({
            required_error: 'Goal name is required.',
            invalid_type_error: 'Goal name must be a string.',
        })
        .min(1, { message: 'Goal name cannot be empty.' })
        .max(128, { message: 'Goal name must be at most 128 characters long.' }),

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
    
    TenantId: z
		.string({
			required_error: 'TenantId is required.',
			invalid_type_error: 'TenantId must be a string.'
		})

});
