import { z } from 'zod';

///////////////////////////////////////////////////////////////////////////////

export const createOrUpdateCategorySchema = z.object({
	Type: z
		.string({
			required_error: 'Category type is required.',
			invalid_type_error: 'Category type must be a string.'
		})
		.min(1, { message: 'Category type cannot be empty.' })
		.max(256, { message: 'Category type must be at most 256 characters long.' }),
	Description: z
		.string({
			required_error: 'Description is required.',
			invalid_type_error: 'Description must be a string.'
		})
		.trim()
		.min(1, { message: 'Description is required.' })
		.max(1024, { message: 'Description must be at most 1024 characters long.' }),
}); 