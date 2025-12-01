import { z } from 'zod';

export const createOrUpdateSchema = z.object({
	LearningPathId: z
		.string({
			invalid_type_error: 'LearningPathId must be a string.'
		})
		.uuid({ message: 'LearningPathId must be a valid UUID.' })
		.optional(),
		
	Name: z
		.string({
			required_error: 'Name is required.',
			invalid_type_error: 'Name must be a string.'
		})
		.min(1, { message: 'Name cannot be empty.' })
		.max(256, { message: 'Name must be at most 256 characters long.' }),
	Description: z
		.string()
		.max(1024, { message: 'Description must be at most 1024 characters long.' })
		.optional(),
	ImageResourceId: z
			.string()
			.max(128, { message: 'Image Resource ID must be at most 128 characters long.' })
			.optional(),
	DurationInDays: z
		.number({
			invalid_type_error: 'DurationInDays must be a number.'
		})
		.positive({ message: 'DurationInDays must be a positive number.' })
		.optional(),
	TenantId: z
		.string({
			required_error: 'TenantId is required.',
			invalid_type_error: 'TenantId must be a string.'
		}),
	Sequence: z
		.number({
			invalid_type_error: 'Sequence must be a number.'
		})
		.positive({ message: 'Sequence must be a positive number.' })
		.optional()
});

