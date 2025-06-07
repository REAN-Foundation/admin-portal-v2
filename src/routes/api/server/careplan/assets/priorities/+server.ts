import type { PriorityCreateModel } from '$lib/types/priority.types';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createOrUpdateSchema } from '$lib/validation/priority.schema';
import { createPriority } from '$routes/api/services/careplan/assets/priority';

import type { RequestEvent } from '@sveltejs/kit';

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside Priority server POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const data: PriorityCreateModel = await request.json();

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

		const response = await createPriority(
			sessionId,
			data.Name,
			data.Description,
			data.Tags,
			data.TenantId,
			data.Version
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating Priority:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
