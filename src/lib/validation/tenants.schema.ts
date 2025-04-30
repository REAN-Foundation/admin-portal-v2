import { z } from 'zod';

export const createOrUpdateSchema = z.object({
	Name: z
		.string({
			required_error: 'Name is required.',
			invalid_type_error: 'Name must be a string.'
		})
		.min(1, { message: 'Name cannot be empty.' })
		.max(256, { message: 'Name must be at most 256 characters long.' }),

	Code: z
		.string({
			required_error: 'Code is required.',
			invalid_type_error: 'Code must be a string.'
		})
		.min(1, { message: 'Code cannot be empty.' })
		.max(100, { message: 'Code must be at most 100 characters long.' }),

	Email: z
		.string({
			required_error: 'Email is required.',
			invalid_type_error: 'Email must be a string.'
		})
		.email({ message: 'Invalid email address.' }),

	Phone: z
		.string({
			required_error: 'Phone number is required.',
			invalid_type_error: 'Phone must be a string.'
		})
		.min(7, { message: 'Phone number is too short.' })
		.max(15, { message: 'Phone number is too long.' }),

	Description: z
		.string({
			invalid_type_error: 'Description must be a string.'
		})
		.max(500, { message: 'Description must be at most 500 characters long.' })
		.optional()
});
