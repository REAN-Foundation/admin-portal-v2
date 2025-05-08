import { z } from 'zod';

export const createOrUpdateSchema = z.object({
    date:z.string().date().optional()
});
