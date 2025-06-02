import { z } from "zod";

///////////////////////////////////////////////////////////////////////////////

export const createOrUpdateSchema = z.object({
	file: z.instanceof(File, { message: "File is required." }),
});

export const ScheduleAppointmentSchema = z.object({
	date: z.coerce.date({
		required_error: 'Date is required',
		invalid_type_error: 'Invalid date format',
	}).refine((d) => d >= new Date(new Date().setHours(0, 0, 0, 0)), {
		message: 'Date cannot be in the past',
	})
});

