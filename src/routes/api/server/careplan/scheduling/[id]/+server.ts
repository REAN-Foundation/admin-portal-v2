import type { CarePlanSchedulingUpdateModel } from '$lib/types/careplan.scheduling.types';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createOrUpdatSchedulingeSchema } from '$lib/validation/careplan.scheduling.schema';
import { uuidSchema } from '$lib/validation/common.schema';
import {
	deleteCarePlanActivity,
	getCarePlanActivityById,
	updateCarePlanActivity
} from '$routes/api/services/careplan/scheduling';
import type { RequestEvent } from '@sveltejs/kit';

///////////////////////////////////////////////////////////////////////////////

export const DELETE = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
		}

		const result = await uuidSchema.safeParseAsync(event.params);
		if (!result.success) {
			const data = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || ''
				])
			);
			return ResponseHandler.handleError(400, data, new Error('Validation failed'));
		}

		const id = event.params.id;

		const response = await deleteCarePlanActivity(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error deleting health system:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.request.headers.get('session-id');
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
		}

		const result = await uuidSchema.safeParseAsync(event.params);
		if (!result.success) {
			const data = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || ''
				])
			);
			return ResponseHandler.handleError(400, data, new Error('Validation failed'));
		}

		const id = event.params.id;

		const response = await getCarePlanActivityById(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error fetching health system:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const PUT = async (event: RequestEvent) => {
	try {
		console.log('Inside health system server PUT endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}
		const careplanId = event.url.searchParams.get('careplanId');

		const activityId = event.params.id;

		const request = event.request;
		const data: CarePlanSchedulingUpdateModel = await request.json();
		const validationResult = createOrUpdatSchedulingeSchema.safeParse(data);
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

		const response = await updateCarePlanActivity(
			sessionId,
			activityId,
			data.AssetType,
			data.AssetId,
			careplanId,
			data.ScheduleDay,
			data.TimeSlot,
			data.Sequence
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error updating health systems:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
