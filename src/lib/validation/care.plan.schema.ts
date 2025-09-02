import { z } from 'zod';

///////////////////////////////////////////////////////////////////////////////

export const createOrUpdateSchema = z.object({
	Name: z
		.string({
			required_error: 'Careplan name is required.',
			invalid_type_error: 'Careplan name must be a string.'
		})
		.min(1, { message: 'Careplan name cannot be empty.' })
		.max(256, { message: 'Careplan name must be at most 256 characters long.' }),
	OwnerUserId: z
		.string({
			required_error: 'OwnerUserId is required.',
			invalid_type_error: 'OwnerUserId must be a string.'
		}),
	TenantId: z
		.string({
			required_error: 'TenantId is required.',
			invalid_type_error: 'TenantId must be a string.'
		}),
	Tags: z.array(z.string()).optional(),
	Code: z
		.string({
			required_error: 'Code is required.',
			invalid_type_error: 'Code must be a string.'
		}),
		
	CategoryId: z
		.string({
			required_error: 'Category is required.',
		}),
	Description: z
		.string()
		.max(1024, { message: 'Description must be at most 1024 characters long.' })
		.optional(),
	Version: z
		.string({
			invalid_type_error: 'Version must be a string.'
		})
		.optional(),
	
});
