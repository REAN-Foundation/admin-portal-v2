import type { AppointmentUpdateModel } from '$lib/types/appointment';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createOrUpdateSchema } from '$lib/validation/appointment.schema';
import { uuidSchema } from '$lib/validation/common.schema';
import { deleteAsset } from '$routes/api/services/careplan/assets/action-plan';
import {
	getAppointmentById,
	updateAppointment
} from '$routes/api/services/careplan/assets/appointment';
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

		const assetId = event.params.assetId;
		const selectAsset = event.params.selectAsset;

		const response = await deleteAsset(sessionId, selectAsset, assetId);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error deleting Asset:', error);
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

		const response = await getAppointmentById(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error fetching Appointment:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const PUT = async (event: RequestEvent) => {
	try {
		console.log('Inside Appointment server PUT endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const appointmentId = event.params.id;
		const request = event.request;
		const data: AppointmentUpdateModel = await request.json();

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

		const response = await updateAppointment(
			sessionId,
			appointmentId,
			data.Name,
			data.Description,
			data.AppointmentType,
			data.Tags,
			data.Version,
			data.TenantId
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error updating Appointment:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
