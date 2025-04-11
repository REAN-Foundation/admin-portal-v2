import { z } from 'zod';

export const updateSymptomSchema = z.object({
	symptom: z.string().min(3).max(256),
	description: z.string().optional(),
	tags: z.array(z.string()).optional(),
	language: z.string().optional(),
	imageResourceId: z.string().optional()
});
