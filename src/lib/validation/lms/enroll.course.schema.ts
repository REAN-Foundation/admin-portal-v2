import { z } from 'zod';

export const enrollToCourseSchema = z.object({
	UserId: z
		.string({
			required_error: 'UserId is required.',
			invalid_type_error: 'UserId must be a string.'
		})
		.uuid({ message: 'UserId must be a valid UUID.' }),
		
	CourseId: z
		.string({
			required_error: 'CourseId is required.',
			invalid_type_error: 'CourseId must be a string.'
		})
		.uuid({ message: 'CourseId must be a valid UUID.' }),
		
	StartDate: z
		.string({
			invalid_type_error: 'StartDate must be a string.'
		})
		.optional(),
		
	ExpectedEndDate: z
		.string({
			invalid_type_error: 'ExpectedEndDate must be a string.'
		})
		.optional()
});

