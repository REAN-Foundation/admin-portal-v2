import { z } from 'zod';
import { zfd } from 'zod-form-data';

export const createOrUpdateSchema = z.object({
    Name: z
        .string({
            required_error: 'Name is required.',
            invalid_type_error: 'Name must be a string.'
        })
        .min(3, { message: 'Name must be at least 3 characters long.' })
        .max(128, { message: 'Name must be at most 128 characters long.' }),

    Description: z
        .string()
        .max(1024, { message: 'Description must be at most 1024 characters long.' })
        .optional(),

    MeditationType: z
        .string()
        .max(128, { message: 'Meditation type must be at most 128 characters long.' })
        .optional(),

    RecommendedDurationMin: zfd.numeric(
        z.number()
            .min(0, { message: 'Duration must be a positive number.' })
            .max(1000, { message: 'Duration must be at most 1000 minutes.' })
            .optional()
    ),

    Tags: z.array(z.string().max(64, { message: 'Tag must be at most 64 characters.' })).optional(),

    Version: z
        .string()
        .max(128, { message: 'Version must be at most 128 characters long.' })
        .optional(),
    TenantId: z
		.string({
			required_error: 'TenantId is required.',
			invalid_type_error: 'TenantId must be a string.'
		})

});
