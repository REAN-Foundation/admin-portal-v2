import { z } from 'zod';

export const createOrUpdateSchema = z.object({
    Name: z
        .string({
            required_error: 'Biometrics name is required.',
            invalid_type_error: 'Biometrics name must be a string.'
        })
        .min(8, { message: 'Biometrics name must be at least 3 characters long.' })
        .max(256, { message: 'Biometrics name must be at most 256 characters long.' }),
    Description: z
        .string()
        .max(1024, { message: 'Description must be at most 1024 characters long.' })
        .optional(),

    BiometricsType: z.string()
        .max(1024, { message: 'Biometrics Type must be at most 1024 characters long.' })
        .optional(),
    MeasurementUnit: z.string()
        .max(1024, { message: 'Measurement Unit must be at most 1024 characters long.' })
        .optional(),
    Tags: z.array(z.string()).optional(),
    Version: z.string()
        .max(1024, { message: 'Version must be at most 1024 characters long.' })
        .optional(),
});