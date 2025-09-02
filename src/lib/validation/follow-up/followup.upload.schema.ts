import { z } from "zod";

///////////////////////////////////////////////////////////////////////////////

export const createOrUpdateSchema = z.object({
	file: z.instanceof(File, { message: "File is required." }),
});

export const ScheduleAppointmentSchema = z.object({
	Date: z
		.string()
		// .trim()
		// .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
		// 	message: 'Invalid date format',
		// })
		// .transform((val) => new Date(val))
		// .refine((date) => !isNaN(date.getTime()), {
		// 	message: 'Invalid date value',
		// })
		// .refine(
		// 	(date) => date >= new Date(new Date().setHours(0, 0, 0, 0)),
		// 	{ message: 'Date cannot be in the past' }
		// ),
});

