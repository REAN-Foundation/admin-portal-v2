import { z } from 'zod';

export const updateHospitalSchema = z.object({
	hospitalName: z.string().max(128),
	healthSystemId: z.string().optional(),
	tags: z.array(z.string()).optional()
});
