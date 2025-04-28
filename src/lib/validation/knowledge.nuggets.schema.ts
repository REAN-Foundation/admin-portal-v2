import { z } from 'zod';

export const createOrUpdateSchema = z.object({
	Name: z
		.string({
			required_error: 'topic name is required.',
			invalid_type_error: 'topic name must be a string.'
		})
		.min(1, { message: 'topic name cannot be empty.' })
		.max(256, { message: 'topic name must be at most 256 characters long.' }),
	AdditionalResources:  z.array(z.string()).optional(),
	DetailedInformation: z.string().optional(),
	BriefInformation: z.string().optional(),
	Tags: z.array(z.string()).optional()
});
