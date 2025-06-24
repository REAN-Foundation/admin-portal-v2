import { z } from 'zod';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const allowedTypes = [
	'application/pdf',
	'application/xml',
	'text/xml',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.ms-excel',
	'text/plain',
	'text/csv',
	'application/json',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.ms-powerpoint',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'text/markdown',
	'application/rtf'
];

export const fileUploadSchema = z.object({
	UploadFile: z.custom<File>(
		(file) => {
			// Check if file exists and has required properties
			if (!file || typeof file !== 'object') return false;
			
			// Check if it has the required properties (works for both File objects and mock objects)
			if (!('size' in file) || !('type' in file) || !('name' in file)) return false;
			
			const isValidSize = file.size <= MAX_FILE_SIZE;
			const isValidType = allowedTypes.includes(file.type);
			
			console.log('File validation check:', {
				size: file.size,
				type: file.type,
				isValidSize,
				isValidType,
				maxSize: MAX_FILE_SIZE,
				allowedTypes
			});

			return isValidSize && isValidType;
		},
		{
			message:
				'Upload file must be a PDF, XML, TEXT, JSON, Excel, Word, or PowerPoint file and less than 50MB.'
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
