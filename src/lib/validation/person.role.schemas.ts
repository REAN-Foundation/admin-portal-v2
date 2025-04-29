import { z } from 'zod';

export const createOrUpdateSchema = z.object({
    Name: z
        .string({
            required_error: 'topic name is required.',
            invalid_type_error: 'topic name must be a string.'
        })
        .min(1, { message: 'topic name cannot be empty.' })
        .max(256, { message: 'topic name must be at most 256 characters long.' }),
    Description: z.string().optional(),
});
