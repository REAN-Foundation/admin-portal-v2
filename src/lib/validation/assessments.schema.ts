import { z } from 'zod';

export const createOrUpdateSchema = z.object({
    Name: z
        .string({
            required_error: 'Assessment name is required.',
            invalid_type_error: 'Assessment name must be a string.'
        })
        .min(8, { message: 'Assessment name must be at least 3 characters long.' })
        .max(256, { message: 'Assessment name must be at most 256 characters long.' }),
    Description: z
        .string()
        .max(1024, { message: 'Description must be at most 1024 characters long.' })
        .optional(),

    Template: z.string()
        .max(1024, { message: 'Template Type must be at most 1024 characters long.' })
        .optional(),

    ReferenceTemplateCode: z.string()
    .max(1024, { message: 'TemplateCode must be at most 1024 characters long.' })
    .optional()
    .or(z.literal('')),
    // ReferenceTemplateCode: z.string()
    //     .max(1024, { message: 'TemplateCode must be at most 1024 characters long.' })
    //     .optional(),
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