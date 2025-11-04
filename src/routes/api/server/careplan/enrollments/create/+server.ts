import { ResponseHandler } from '$lib/utils/response.handler';
import type { RequestEvent } from '@sveltejs/kit';
import { createEnrollment } from '$routes/api/services/careplan/enrollments';
import { createSchema } from '$lib/validation/enrollment.schema';
import type { EnrollmentCreateModel } from '$lib/types/enrollment.types';

///////////////////////////////////////////////////////////////////////////////
export const POST = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		const tenantName = event.locals?.sessionUser?.tenantCode;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const data: EnrollmentCreateModel = await request.json();

		console.log('data', data);
		const validationResult = createSchema.safeParse(data);
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

		const response = await createEnrollment(
			sessionId,
			tenantName,
			data.PatientUserId,
			data.PlanName,
			data.PlanCode,
			data.Channel,
			data.Language,
			data.NumberOfDays,
			data.StartHour,
			data.StartMinutes,
			data.IntervalMinutes,
			data.StartFromTomorrow
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating enrollment:', error);
		return ResponseHandler.handleError(500, null, error);
	}
}; 