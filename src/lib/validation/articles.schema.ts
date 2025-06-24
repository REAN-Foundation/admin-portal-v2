import { z } from 'zod';

export const createOrUpdateSchema = z.object({
	Name: z
		.string({
			required_error: 'Name is required.',
			invalid_type_error: 'Name must be a string.'
		})
		.min(1, { message: 'Name cannot be empty.' })
		.max(128, { message: 'Name must be at most 128 characters long.' }),

	Summary: z
		.string({invalid_type_error: 'Summary must be a string.'})
		.max(1024, { message: 'Transcript must be at most 1024 characters long.' })
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
		.optional(),
	TenantId: z
		.string({
			required_error: 'TenantId is required.',
			invalid_type_error: 'TenantId must be a string.'
		})
});
