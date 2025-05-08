import { ResponseHandler } from '$lib/utils/response.handler';
import type { RequestEvent } from '@sveltejs/kit';
import { createAppointment } from '$routes/api/services/careplan/assets/appointment';
import { createOrUpdateSchema } from '$lib/validation/appointment.schema';
import type { AppointmentCreateModel } from '$lib/types/appointment';

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside Action plan server POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const data: AppointmentCreateModel = await request.json();

		console.log('data', data);
		const validationResult = createOrUpdateSchema.safeParse(data);
		if (!validationResult.success) {
			return ResponseHandler.success({
				Status: 'failure',
				HttpCode: 400,
				Message: 'Validation failed',
				Errors: Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || ''
					])
				)
			});
		}

		const response = await createAppointment(
			sessionId,
			data.Name,
			data.Description,
			data.AppointmentType,
			data.Tags,
			data.Version
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating Appointment:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
