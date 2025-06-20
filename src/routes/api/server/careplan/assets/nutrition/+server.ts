import type { NutritionCreateModel } from '$lib/types/nutrition.types';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createOrUpdateSchema } from '$lib/validation/nutrition.schema';
import { createNutrition } from '$routes/api/services/careplan/assets/nutrition';

import type { RequestEvent } from '@sveltejs/kit';

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside Nutrition server POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const data: NutritionCreateModel = await request.json();

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

		const response = await createNutrition(
			sessionId,
			data.Name,
			data.Description,
			data.Tags,
			data.Version,
			data.TenantId,
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating Nutrition:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
