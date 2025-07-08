import { z } from "zod";

export const createOrUpdateSchema = z.object({
	Type: z
		.string({
			required_error: 'Priorities name is required.',
			invalid_type_error: 'Priorities name must be a string.',
		})
		.min(1, { message: 'Priorities name cannot be empty.' })
		.max(256, { message: 'Priorities name must be at most 256 characters long.' }),
	Tags: z.array(z.string()).optional(),
});

