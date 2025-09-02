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
			required_error: 'Contact number is required.',
			invalid_type_error: 'Contact must be a string.'
		})
		.min(7, { message: 'Contact number is too short.' })
		.max(15, { message: 'Contact number is too long.' }),

	Description: z
		.string({
			invalid_type_error: 'Description must be a string.'
		})
		.max(500, { message: 'Description must be at most 500 characters long.' })
		.optional(),

	Username: z
		.string({
			invalid_type_error: 'UserName must be a string.'
		})
		.max(10, { message: 'UserName must be at most 10 characters long.' })
		.optional()
		.refine(
			val => val === undefined || val === null || val === '' || val.length >= 1,
			{ message: 'UserName cannot be empty.' }
		),

	Password: z
		.string()
		.max(256, { message: 'Password must be at most 256 characters long.' })
		.optional()
		.refine(
			val =>
				!val ||
				(
					val.length >= 8 &&
					/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/.test(val)
				),
			{
				message:
					'The password should be at least 8 characters long and must contain at least 1 capital letter, 1 small letter, 1 digit, and 1 special character.'
			}
		),
});
