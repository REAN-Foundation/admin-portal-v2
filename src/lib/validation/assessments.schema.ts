import { z } from 'zod';

const metaDataSchema = z.object({
    Type: z
        .string({
            required_error: 'Type is required.',
            invalid_type_error: 'Type must be a string.'
        })
        .min(1, { message: 'Type cannot be empty' })
        .max(128, { message: 'Type must be at most 128 characters long.' }),
    TemplateName: z
        .string({
            required_error: 'TemplateName is required.',
            invalid_type_error: 'TemplateName must be a string.'
        })
        .min(1, { message: 'TemplateName cannot be empty' })
        .max(256, { message: 'TemplateName must be at most 256 characters long.' }),
    TemplateLanguage: z
        .string()
        .max(64, { message: 'TemplateLanguage must be at most 64 characters long.' })
        .optional(),
    FlowToken: z
        .string()
        .max(512, { message: 'FlowToken must be at most 512 characters long.' })
        .optional(),
    FlowActionData: z
        .record(z.any())
        .optional()
});

export const createOrUpdateSchema = z.object({
    Name: z
        .string({
            required_error: 'Name is required.',
            invalid_type_error: 'Name must be a string.'
        })
        .min(1, { message: 'Name cannot be empty' })
        .max(256, { message: 'Name must be at most 256 characters long.' }),
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
		}),
    Metadata: metaDataSchema.optional()
});