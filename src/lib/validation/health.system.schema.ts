import { z } from "zod";

export const createOrUpdateSchema = z.object({
	Name: z
		.string({
			required_error: 'Health system name is required.',
			invalid_type_error: 'Health system name must be a string.',
		})
		.min(1, { message: 'Health system name cannot be empty.' })
		.max(256, { message: 'Health system name must be at most 256 characters long.' }),
	Tags: z.array(z.string()).optional(),
});

