import { z } from 'zod';

export const createOrUpdateSchema = z.object({
	Name: z
		.string({
			required_error: 'Care plan name is required.',
			invalid_type_error: 'Care plan name must be a string.'
		})
		.min(1, { message: 'Care plan name cannot be empty.' })
		.max(256, { message: 'Care plan name must be at most 256 characters long.' }),
	Tags: z.array(z.string()).optional(),
	Code: z
		.string({
			required_error: 'AssetId is required.',
			invalid_type_error: 'AssetId must be a string.'
		})
		.optional(),
	CategoryId: z
		.string({
			required_error: 'AssetId is required.',
			invalid_type_error: 'AssetId must be a string.'
		})
		.optional(),
	Description: z
		.string({
			required_error: 'AssetId is required.',
			invalid_type_error: 'AssetId must be a string.'
		})
		.optional(),
	Version: z
		.string({
			required_error: 'AssetId is required.',
			invalid_type_error: 'AssetId must be a string.'
		})
		.optional(),
});
