import { ResponseHandler } from '$lib/utils/response.handler';
import type { RequestEvent } from '@sveltejs/kit';
import { createReminder } from '$routes/api/services/follow-up/reminders';
import type { ScheduleAppointmentModel } from '$lib/types/follow-up/followup.upload';
import { ScheduleAppointmentSchema } from '$lib/validation/follow-up/followup.upload.schema';

///////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside create remider POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;
		const tenantCode = event.locals?.sessionUser.tenantCode;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const data: ScheduleAppointmentModel = await request.json();

		console.log('data', data);
		const validationResult = ScheduleAppointmentSchema.safeParse(data);
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

		const response = await createReminder(tenantCode, data.Date);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating reminder:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
