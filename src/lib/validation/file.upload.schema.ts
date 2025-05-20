import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const fileUploadSchema = z.object({
	UploadFile: z
		.custom<File>((file) => {
			if (typeof file === 'undefined' || file === null) return false;
			return file instanceof File && file.size <= MAX_FILE_SIZE;
		}, {
			message: 'Upload file is required and must be less than 5MB.'
		}),
	FileName: z.string({
		required_error: 'File name is required.',
		invalid_type_error: 'File name must be a string.'
	}),
	FileType: z.string({
		required_error: 'File type is required.',
		invalid_type_error: 'File type must be a string.'
	})
});
