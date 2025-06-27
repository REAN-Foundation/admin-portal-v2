import type { CareplanCategoryUpdateModel } from '$lib/types/careplan.category.types';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createOrUpdateCategorySchema } from '$lib/validation/careplan.category.schema';
import { uuidSchema } from '$lib/validation/common.schema';
import {
	deleteCareplanCategory,
	getCareplanCategoryById,
	updateCareplanCategory
} from '$routes/api/services/careplan/careplan.category';
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

		const response = await deleteCareplanCategory(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error deleting careplan category:', error);
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

		const response = await getCareplanCategoryById(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error fetching careplan category:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const PUT = async (event: RequestEvent) => {
	try {
		console.log('Inside careplan category server PUT endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const categoryId = event.params.id;

		const request = event.request;
		const data: CareplanCategoryUpdateModel = await request.json();
		const validationResult = createOrUpdateCategorySchema.safeParse(data);
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

		const response = await updateCareplanCategory(sessionId, categoryId, data.Type, data.Description);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error updating careplan category:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
