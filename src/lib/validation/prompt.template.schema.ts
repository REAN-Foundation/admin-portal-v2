import { z } from 'zod';
export const createOrUpdateSchema = z.object({
    Name: z
        .string({
            required_error: 'Prompt Template name is required.',
            invalid_type_error: 'Prompt Template name must be a string.'
        })
        .min(1, { message: 'Prompt Template name cannot be empty.' })
        .max(256, { message: 'Prompt Template name must be at most 256 characters long.' }),
    Description: z.string().optional(),
    Model: z.string({
        required_error: 'Model is required.',
        invalid_type_error: 'Model must be a string.'
    }),
    Prompt: z.string({
        required_error: 'Prompt is required.',
        invalid_type_error: 'Prompt must be a string.'
    }),
    Temperature: z.number().optional(),
    TopP: z.number().optional(),
    FrequencyPenalty: z.number().optional(),
    PresencePenalty: z.number().optional(),
    Group: z.string().optional(),
    UseCaseType: z.string().optional(),
    Variables: z.array(z.string()).optional()
});