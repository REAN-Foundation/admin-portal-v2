import { z } from 'zod';

export const createOrUpdateSchema = z.object({
	Symptom: z
		.string({
			required_error: 'Symptom is required.',
			invalid_type_error: 'Symptom must be a string.'
		})
		.min(3, { message: 'Symptom must be at least 3 characters long.' })
		.max(256, { message: 'Symptom must be at most 256 characters long.' }),

	Description: z
		.string()
		.max(1024, { message: 'Description must be at most 1024 characters long.' })
		.optional(),

	Tags: z.array(z.string()).optional(),

	Language: z
		.string({
			required_error: 'Language is required.'
		})
		.min(3, { message: 'Language must be at least 3 characters long.' })
		.max(64, { message: 'Language must be at most 64 characters long.' }),
	ImageResourceId: z
		.string()
		.max(128, { message: 'Image Resource ID must be at most 128 characters long.' })
		.optional()
});
