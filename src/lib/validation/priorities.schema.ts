import { z } from "zod";

export const createOrUpdateSchema = z.object({
	Type: z
		.string({
			required_error: 'Type name is required.',
			invalid_type_error: 'Type name must be a string.',
		})
		.min(1, { message: 'Type name cannot be empty.' })
		.max(256, { message: 'Type name must be at most 256 characters long.' }),
	Tags: z.array(z.string()).optional(),
});

