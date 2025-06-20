import { z } from 'zod';

export const createOrUpdateSchema = z.object({
    Name: z
            .string({
                required_error: 'Consultation name is required.',
                invalid_type_error: 'Consultation name must be a string.',
            })
            .min(1, { message: 'Consultation name cannot be empty.' })
            .max(128, { message: 'Consultation name must be at most 128 characters long.' }),
    Description: z
        .string()
        .max(1024, { message: 'Description must be at most 1024 characters long.' })
        .optional(),

    ConsultationType: z.string()
        .max(1024, { message: 'Consultation Type must be at most 1024 characters long.' })
        .optional(),
    Tags: z.array(z.string()).optional(),
    Version: z.string()
        .max(1024, { message: 'Version must be at most 1024 characters long.' })
        .optional(),
    TenantId: z
		.string({
			required_error: 'TenantId is required.',
			invalid_type_error: 'TenantId must be a string.'
		})
});