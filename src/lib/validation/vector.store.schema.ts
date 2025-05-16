import { z } from 'zod';

export const createSchema = z.object({
	id: z.string({
		invalid_type_error: 'File resource id must be a string.'
	}),
	TenantId: z.string({
		invalid_type_error: 'Tenant id must be a string.'
	}).optional(),
	Version: z.number({
		invalid_type_error: 'Version must be a number.'
	})
});
