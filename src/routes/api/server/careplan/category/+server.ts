import { ResponseHandler } from '$lib/utils/response.handler';
import type { RequestEvent } from '@sveltejs/kit';
import type { CareplanCategoryCreateModel } from '$lib/types/careplan.category.types';
import { createOrUpdateCategorySchema } from '$lib/validation/careplan.category.schema';
import { createCareplanCategory } from '$routes/api/services/careplan/careplan.category';

/////////////////////////////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	try {
		const sessionId = event.cookies.get('sessionId');
        const tenantId = event.locals.sessionUser.tenantId;


		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const data: CareplanCategoryCreateModel = await request.json();

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

		const response = await createCareplanCategory(sessionId, data.Type, data.Description,tenantId);

		return ResponseHandler.success(response);
	} catch (error) {
		return ResponseHandler.handleError(500, null, error);
	}
};
