import { z } from "zod";

export const createOrUpdateSchema = z.object({
    Name: z
        .string({
            required_error: 'Prompt Template name is required.',
            invalid_type_error: 'Prompt Template name must be a string.',
        })
        .min(1, { message: 'Prompt Template name cannot be empty.' })
        .max(256, { message: 'Prompt Template name must be at most 256 characters long.' }),
    Description:z.string().optional(),
    Content: z.string(),
    Type:z.string().optional(),
    Category : z.string().optional(),
    SubGroup : z.string().optional(),
    Variables: z.array(z.string()).optional(),
    Version: z.number().optional(),
});

