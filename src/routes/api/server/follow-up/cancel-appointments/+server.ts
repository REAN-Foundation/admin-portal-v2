import { ResponseHandler } from '$lib/utils/response.handler';
import { cancelAppointments as cancelAppointments } from '$routes/api/services/follow-up/reminders';
import { appointmentCancelSchema } from '$lib/validation/follow-up/reminder.schema';
import type { AppointmentCancelModel } from '$lib/types/follow-up/followup.upload';
import type { RequestEvent } from '@sveltejs/kit';

///////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside cancel appointmentr POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;
		const tenantCode = event.locals?.sessionUser.tenantCode;
		const userId = event.locals?.sessionUser.userId;
		const userName = event.locals?.sessionUser.username;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const data: AppointmentCancelModel = await request.json();

		const validationResult = appointmentCancelSchema.safeParse(data);
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

		const dates = data.Dates;
		let response;
		const scheduledDates: any[] = [];
		const unscheduledDates: any[] = [];
		if (dates) {
			for (const date of dates) {
				response = await cancelAppointments(
					date,
					tenantCode,
					userId,
					userName,
					data.Message
				);

				if (response.Status === 'success') {
					scheduledDates.push(date);
				}
				if (response.Status !== 'success') {
					unscheduledDates.push(date);
				}
			}
		}
		response.ScheduledDates = scheduledDates;
		response.UnscheduledDates = unscheduledDates;
		console.log('Scheduled dates', scheduledDates);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error in appointment cancellation:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
