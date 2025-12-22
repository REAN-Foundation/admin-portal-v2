import { z } from 'zod';

// Param schemas (SvelteKit: event.params keys must match folder names)
export const userIdParamSchema = z.object({
	userId: z.string().uuid({ message: 'userId must be a valid UUID.' })
});

export const userLearningPathParamSchema = z.object({
	userId: z.string().uuid({ message: 'userId must be a valid UUID.' }),
	learningPathId: z.string().uuid({ message: 'learningPathId must be a valid UUID.' })
});

export const userCourseParamSchema = z.object({
	userId: z.string().uuid({ message: 'userId must be a valid UUID.' }),
	courseId: z.string().uuid({ message: 'courseId must be a valid UUID.' })
});

export const userModuleParamSchema = z.object({
	userId: z.string().uuid({ message: 'userId must be a valid UUID.' }),
	moduleId: z.string().uuid({ message: 'moduleId must be a valid UUID.' })
});

export const userContentParamSchema = z.object({
	userId: z.string().uuid({ message: 'userId must be a valid UUID.' }),
	contentId: z.string().uuid({ message: 'contentId must be a valid UUID.' })
});

export const updateUserLearningParamSchema = z.object({
	userId: z.string().uuid({ message: 'userId must be a valid UUID.' }),
	learningPathId: z.string().uuid({ message: 'learningPathId must be a valid UUID.' }),
	contentId: z.string().uuid({ message: 'contentId must be a valid UUID.' })
});

export const updateUserLearningBodySchema = z.object({
	LearningPathId: z.string().uuid({ message: 'LearningPathId must be a valid UUID.' }).nullable().optional(),
	CourseId: z.string().uuid({ message: 'CourseId must be a valid UUID.' }).nullable().optional(),
	ModuleId: z.string().uuid({ message: 'ModuleId must be a valid UUID.' }).nullable().optional(),
	ProgressStatus: z
		.string({
			invalid_type_error: 'ProgressStatus must be a string.'
		})
		.max(64, { message: 'ProgressStatus must be at most 64 characters long.' })
		.nullable()
		.optional()
});





