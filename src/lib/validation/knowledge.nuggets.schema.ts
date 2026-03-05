import { z } from 'zod';

export const createOrUpdateSchema = z.object({
	Name: z
		.string({
			required_error: 'Name is required.',
			invalid_type_error: 'Name must be a string.'
		})
		.min(1, { message: 'Name cannot be empty.' })
		.max(256, { message: 'Name must be at most 256 characters long.' }),
	AdditionalResources: z.array(z.string()).nullish(),
	DetailedInformation: z.string().nullish(),
	BriefInformation: z.string().nullish(),
	Tags: z.array(z.string()).nullish()
});
