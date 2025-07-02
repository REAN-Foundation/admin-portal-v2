import { z } from 'zod';

export const createOrUpdateSchema = z.object({
	Name: z
		.string({
			required_error: 'Name is required.',
			invalid_type_error: 'Name must be a string.'
		})
		.min(1, { message: 'Name cannot be empty.' })
		.max(128, { message: 'Name must be at most 128 characters long.' }),
	Description: z
		.string()
		.max(1024, { message: 'Description must be at most 1024 characters long.' })
		.optional(),

	BiometricsType: z
		.string()
		.max(1024, { message: 'Biometrics Type must be at most 1024 characters long.' })
		.optional(),
	MeasurementUnit: z
		.string()
		.max(1024, { message: 'Measurement Unit must be at most 1024 characters long.' })
		.optional(),
	Tags: z.array(z.string()).optional(),
	Version: z
		.string()
		.max(1024, { message: 'Version must be at most 1024 characters long.' })
		.optional(),
	TenantId: z
		.string({
			required_error: 'TenantId is required.',
			invalid_type_error: 'TenantId must be a string.'
		})
});
