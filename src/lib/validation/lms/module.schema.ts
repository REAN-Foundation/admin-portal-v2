import { z } from 'zod';

export const createOrUpdateSchema = z.object({
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
	DurationInMins: z
		.number({
			invalid_type_error: 'DurationInMins must be a number.'
		})
		.positive({ message: 'DurationInMins must be a positive number.' })
		.optional(),
	ImageUrl: z
		.string()
		.max(512, { message: 'ImageUrl must be at most 512 characters long.' })
		.optional(),
	// ContentSequence: z
	// 	.number({
	// 		invalid_type_error: 'Content Sequence must be a number.'
	// 	})
	// 	.positive({ message: 'Content Sequence must be a positive number.' })
	// 	.optional(),
	CourseId: z
		.string()
		.min(1, { message: 'CourseId cannot be empty.' })
		.optional(),
});

