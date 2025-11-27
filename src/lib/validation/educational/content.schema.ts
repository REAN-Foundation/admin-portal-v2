import { z } from 'zod';

export const createOrUpdateSchema = z.object({
	ModuleId: z
		.string({
			required_error: 'ModuleId is required.',
			invalid_type_error: 'ModuleId must be a string.'
		})
		.uuid({ message: 'ModuleId must be a valid UUID.' })
		.optional(),
	Title: z
		.string({
			required_error: 'Title is required.',
			invalid_type_error: 'Title must be a string.'
		})
		.min(1, { message: 'Title cannot be empty.' })
		.max(256, { message: 'Title must be at most 256 characters long.' }),
	Description: z
		.string()
		.max(1024, { message: 'Description must be at most 1024 characters long.' })
		.optional(),
	Sequence: z
		.number({
			invalid_type_error: 'Sequence must be a number.'
		})
		.positive({ message: 'Sequence must be a positive number.' })
		.optional(),
	ContentType: z
		.string({
			required_error: 'ContentType is required.',
			invalid_type_error: 'ContentType must be a string.'
		})
		.min(1, { message: 'ContentType cannot be empty.' }),
	ResourceLink: z
		.string()
		.max(512, { message: 'ResourceLink must be at most 512 characters long.' })
		.optional(),
	ImageUrl: z
		.string()
		.max(512, { message: 'ImageUrl must be at most 512 characters long.' })
		.optional(),
	DurationInMins: z
		.number({
			invalid_type_error: 'DurationInMins must be a number.'
		})
		.positive({ message: 'DurationInMins must be a positive number.' })
		.optional(),
	learningPathId: z
			.string()
			.min(1, { message: 'CourseId cannot be empty.' })
			.optional()
	// ActionTemplateId: z
	// 	.string({
	// 		required_error: 'ActionTemplateId is required.',
	// 		invalid_type_error: 'ActionTemplateId must be a string.'
	// 	})

});

