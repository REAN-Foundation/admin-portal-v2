import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedTypes = [
	'application/pdf',
	'application/xml',
	'text/xml',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.ms-excel',
	'text/plain',
	'text/csv',
	'application/json'
];

export const fileUploadSchema = z.object({
	UploadFile: z.custom<File>(
		(file) => {
			if (!file || !(file instanceof File)) return false;

			const isValidSize = file.size <= MAX_FILE_SIZE;
			const isValidType = allowedTypes.includes(file.type);

			return isValidSize && isValidType;
		},
		{
			message:
				'Upload file must be a PDF, XML, TEXT, JSON, or Excel file and less than 5MB.'
		}
	),
	FileName: z.string({
		required_error: 'File name is required.',
		invalid_type_error: 'File name must be a string.'
	}),
	FileType: z.string({
		required_error: 'File type is required.',
		invalid_type_error: 'File type must be a string.'
	})
});
