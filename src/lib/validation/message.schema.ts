import { z } from "zod";

export const createOrUpdateSchema = z.object({
    Name: z
        .string({
            required_error: 'Infographics name is required.',
            invalid_type_error: 'Infographics name must be a string.',
        })
        .min(1, { message: 'Infographics name cannot be empty.' })
        .max(128, { message: 'Infographics name must be at most 128 characters long.' }),

    Description: z
        .string({
            invalid_type_error: 'Description must be a string.',
        })
        .optional(),

    MessageType: z.string()
        .max(1024, { message: 'Message Type must be at most 1024 characters long.' })
        .optional(),

    TemplateName: z.string()
        .max(1024, { message: 'Template Name must be at most 1024 characters long.' })
        .optional(),

    TemplateVariables: z
		.record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
		.optional(),
    PathUrl: z
        .string({
            invalid_type_error: 'Path URL must be a string.'
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
