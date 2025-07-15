import { z } from 'zod';

export const createOrUpdateSchema = z.object({
	Name: z
		.string({
			required_error: 'Name is required.',
			invalid_type_error: 'Name must be a string.'
		})
		.min(1, { message: 'Name cannot be empty.' })
		.max(256, { message: 'Name must be at most 256 characters long.' }),
	AdditionalResources:  z.array(z.string()).optional(),
	DetailedInformation: z.string().optional(),
	BriefInformation: z.string().optional(),
	Tags: z.array(z.string()).optional()
});
