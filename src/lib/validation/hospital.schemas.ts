import { z } from 'zod';

export const updateHospitalSchema = z.object({
	hospitalName: z.string().max(128),
	healthSystemId: z.string().optional(),
	tags: z.array(z.string()).optional()
});



export const createOrUpdateSchema = z.object({
	Name: z
		.string({
			required_error: 'Hospital name is required.',
			invalid_type_error: 'Hospital name must be a string.',
		})
		.min(1, { message: 'Hospital name cannot be empty.' })
		.max(256, { message: 'Hospital name must be at most 256 characters long.' }),
	Tags: z.array(z.string()).optional(),
});

