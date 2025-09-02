import { z } from "zod";

export const createOrUpdateSchema = z.object({
    Name: z
        .string({
            required_error: 'Name is required.',
            invalid_type_error: 'Name must be a string.',
        })
        .min(1, { message: 'Name cannot be empty.' })
        .max(128, { message: 'Name must be at most 128 characters long.' }),

    Description: z
		.string()
		.max(1024, { message: 'Description must be at most 1024 characters long.' })
		.optional(),

    MessageType: z.string()
        .max(1024, { message: 'Message Type must be at most 1024 characters long.' })
        .optional(),

    TemplateName: z.string()
        .max(1024, { message: 'Template Name must be at most 1024 characters long.' })
        .optional(),

     TemplateVariables: z
        .any()
        .optional()
        .refine(
            (val) => {
                if (val === undefined || val === null) return true;
                return typeof val === 'object' && val !== null;
            },
            {
                message: "TemplateVariables must be a valid JSON object",
            }
        ),

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
