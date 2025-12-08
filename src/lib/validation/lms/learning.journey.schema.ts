import { z } from 'zod';

export const createOrUpdateSchema = z.object({
	TenantId: z
		.string({
			required_error: 'TenantId is required.',
			invalid_type_error: 'TenantId must be a string.'
		})
		.uuid({ message: 'TenantId must be a valid UUID.' }),
		
	Name: z
		.string({
			required_error: 'Name is required.',
			invalid_type_error: 'Name must be a string.'
		})
		.min(1, { message: 'Name cannot be empty.' })
		.max(64, { message: 'Name must be at most 64 characters long.' }),
		
	Description: z
		.string({
			invalid_type_error: 'Description must be a string.'
		})
		.max(2000, { message: 'Description must be at most 2000 characters long.' })
		.optional(),
		
	ImageUrl: z
		.string({
			invalid_type_error: 'ImageUrl must be a string.'
		})
		.max(1000, { message: 'ImageUrl must be at most 1000 characters long.' })
		.optional(),
		
	DurationInDays: z
		.number({
			invalid_type_error: 'DurationInDays must be a number.'
		})
		.int({ message: 'DurationInDays must be an integer.' })
		.optional(),
		
	PreferenceWeight: z
		.number({
			invalid_type_error: 'PreferenceWeight must be a number.'
		})
		.int({ message: 'PreferenceWeight must be an integer.' })
		.optional(),
		
	Enabled: z
		.boolean({
			invalid_type_error: 'Enabled must be a boolean.'
		})
		.optional(),
		
	CourseIds: z
		.array(
			z.string().uuid({ message: 'Each CourseId must be a valid UUID.' })
		)
		.optional()
});
