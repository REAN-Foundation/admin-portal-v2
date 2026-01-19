import { z } from 'zod';

export const createOrUpdateSchema = z.object({
	Name: z
		.string({
			required_error: 'Document name is required.',
			invalid_type_error: 'Document name must be a string.'
		})
		.min(1, { message: 'Documents name cannot be empty.' })
		.max(256, { message: 'Documents name must be at most 256 characters long.' }),
	Description: z
		.string({
			required_error: 'Description is required.',
			invalid_type_error: 'Description must be a string.'
		})
		.nullable().optional(),
        
	FileName: z.string().optional(),
	Source: z.string().optional(),
	ParentDocument: z.string().optional(),
	Active: z.boolean(),
	CreatedBy: z.string().optional(),
	ChunkingStratergy: z
		.string({
			required_error: 'Chunking stratergy is required.',
			invalid_type_error: 'Chunking stratergy must be a string.'
		})
		.min(1, { message: 'Chunking stratergy cannot be empty.' }),
	ChunkingLength: z
		.number({
			required_error: 'Chunking length is required.',
			invalid_type_error: 'Chunking length must be a number.'
		})
		.min(1, { message: 'Chunking length cannot be empty.' })
		.max(10000, {
			message: 'Chunking length must not exceed 10000.',
		}),
	ChunkingOverlap: z
		.number({
			required_error: 'Chunking overlap is required.',
			invalid_type_error: 'Chunking overlap must be a number.'
		})
		.min(1, { message: 'Chunking overlap cannot be empty.' }),
	Splitter: z
		.string({
			required_error: 'Splitter is required.',
			invalid_type_error: 'Splitter must be a string.'
		})
		.min(1, { message: 'Splitter cannot be empty.' }),
	ResourceId: z.string(),
	Keywords: z
		.array(z.string())
		.nullable()
		.optional()
		.default([]),
	DocumentType: z
		.string({
			required_error: 'Document type is required.',
			invalid_type_error: 'Document type must be a string.'
		})
		.min(1, { message: 'Document type cannot be empty.' })
}).refine(
	(data) => data.ChunkingOverlap < data.ChunkingLength,
	{
		message: 'Chunking Overlap must be less than Chunking Length.',
		path: ['ChunkingOverlap']
	}
);
