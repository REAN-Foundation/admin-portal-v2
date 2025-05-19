import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const fileUploadSchema = z.object({
	UploadFile: z
		.any({
			required_error: 'upload file is required.',
			invalid_type_error: 'upload file is required.'
		})
		.refine((file) => file.size <= MAX_FILE_SIZE, {
			message: 'File size must be less than 5MB'
		})
		,
	FileName: z.string(),
	FileType: z.string()
});
