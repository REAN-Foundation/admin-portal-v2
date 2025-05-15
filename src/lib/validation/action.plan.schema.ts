import { z } from 'zod';

export const createOrUpdateSchema = z.object({
	Name: z
		.string({
			required_error: 'Action Plan name is required.',
			invalid_type_error: 'Action Plan name must be a string.'
		})
		.min(1, { message: 'Action Plan name cannot be empty.' })
		.max(256, { message: 'Action Plan name must be at most 256 characters long.' }),
	Tags: z.array(z.string()).optional()
});
