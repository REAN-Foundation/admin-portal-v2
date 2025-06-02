import { z } from 'zod';

export const createOrUpdateSchema = z.object({
  FirstName: z.string().optional(),
	LastName: z.string().optional(),
	Phone: z.string(),
	CountryCode:z.string(),
	Email: z.string().email({
		message: 'Invalid email address'
	}),
	RoleId: z.number().optional(),
    Role:z.string().optional(),
	ResourceId: z.string().uuid().optional()
});


const MAX_FILE_SIZE = 150 * 1024; // 150KB


export const profileFileUploadSchema = z.object({
	UploadFile: z
		.any({
			required_error: 'upload file is required.',
			invalid_type_error: 'upload file is required.'
		})
		.refine((file) => file.size <= MAX_FILE_SIZE, {
			message: 'File size must be less than 150 KB'
		})
		,
	FileName: z.string(),
	FileType: z.string()
});
