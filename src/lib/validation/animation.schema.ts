import { z } from 'zod';

export const createOrUpdateSchema = z.object({
	Name: z
		.string({
			required_error: 'Animation Name is required.',
			invalid_type_error: 'Name must be a string.'
		})
		.min(1, { message: 'Name cannot be empty.' })
		.max(128, { message: 'Name must be at most 128 characters long.' }),

	Transcript: z
		.string({
			invalid_type_error: 'Transcript must be a string.'
		})
		.optional(),

	PathUrl: z
		.string({
			invalid_type_error: 'Path URL must be a string.'
		})
		.optional(),

	Tags: z
		.array(
			z.string({
				invalid_type_error: 'Each tag must be a string.'
			})
		)
		.optional(),

	Version: z
		.string({
			invalid_type_error: 'Version must be a string.'
		})
		.optional()
});
