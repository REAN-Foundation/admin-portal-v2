import { z } from 'zod';

///////////////////////////////////////////////////////////////////////////////

export const createSchema = z.object({
	PatientUserId: z
		.string({
			required_error: 'Patient User ID is required.',
			invalid_type_error: 'Patient User ID must be a string.'
		})
		.min(1, { message: 'Patient User ID cannot be empty.' }),
	PlanName: z
		.string({
			required_error: 'Plan Name is required.',
			invalid_type_error: 'Plan Name must be a string.'
		})
		.min(1, { message: 'Plan Name cannot be empty.' }),
	PlanCode: z
		.string({
			required_error: 'Plan Code is required.',
			invalid_type_error: 'Plan Code must be a string.'
		})
		.min(1, { message: 'Plan Code cannot be empty.' }),
	channel: z
		.string({
			invalid_type_error: 'Channel must be a string.'
		})
		.optional()
		.default('default')
});

export const updateSchema = z.object({
	PatientUserId: z
		.string({
			invalid_type_error: 'Patient User ID must be a string.'
		})
		.min(1, { message: 'Patient User ID cannot be empty.' })
		.optional(),
	PlanName: z
		.string({
			invalid_type_error: 'Plan Name must be a string.'
		})
		.min(1, { message: 'Plan Name cannot be empty.' })
		.optional(),
	PlanCode: z
		.string({
			invalid_type_error: 'Plan Code must be a string.'
		})
		.min(1, { message: 'Plan Code cannot be empty.' })
		.optional(),
	channel: z
		.string({
			invalid_type_error: 'Channel must be a string.'
		})
		.optional()
}); 