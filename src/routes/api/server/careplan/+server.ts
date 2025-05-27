import { ResponseHandler } from '$lib/utils/response.handler';
import type { RequestEvent } from '@sveltejs/kit';
import type { CarePlanCreateModel } from '$lib/types/careplan.types';
import { createOrUpdateSchema } from '$lib/validation/care.plan.schema';
import { createCareplan } from '$routes/api/services/careplan/careplans';

/////////////////////////////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	try {
		const sessionId = event.cookies.get('sessionId');

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const data: CarePlanCreateModel = await request.json();

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

		const response = await createCareplan(
			sessionId,
			data.Code,
			data.CategoryId,
			data.Name,
			data.Description,
			data.Tags,
			data.Version
		);

		return ResponseHandler.success(response);
	} catch (error) {
		return ResponseHandler.handleError(500, null, error);
	}
};
