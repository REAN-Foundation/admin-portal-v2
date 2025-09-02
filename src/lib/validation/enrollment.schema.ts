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
		.default('WhatsApp'),
	NumberOfDays: z
		.number({
			invalid_type_error: 'NumberOfDays must be a number.'
		})
		.min(1, { message: 'NumberOfDays must be at least 1.' })
		.max(365, { message: 'NumberOfDays cannot exceed 365.' })
		.optional()
		.default(12),
	StartHour: z
		.number({
			invalid_type_error: 'StartHour must be a number.'
		})
		.min(0, { message: 'StartHour must be between 0 and 23.' })
		.max(23, { message: 'StartHour must be between 0 and 23.' })
		.optional()
		.default(10),
	StartMinutes: z
		.number({
			invalid_type_error: 'StartMinutes must be a number.'
		})
		.min(0, { message: 'StartMinutes must be between 0 and 59.' })
		.max(59, { message: 'StartMinutes must be between 0 and 59.' })
		.optional()
		.default(30),
	IntervalMinutes: z
		.number({
			invalid_type_error: 'IntervalMinutes must be a number.'
		})
		.min(0, { message: 'IntervalMinutes must be non-negative.' })
		.optional()
		.default(0),
	StartFromTomorrow: z
		.boolean({
			invalid_type_error: 'StartFromTomorrow must be a boolean.'
		})
		.optional()
		.default(false)
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