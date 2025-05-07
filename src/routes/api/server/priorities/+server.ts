import type { RequestEvent } from '@sveltejs/kit';
import { createPriority } from '../../services/reancare/priorities';
import { ResponseHandler } from '$lib/utils/response.handler';
import type { PrioritiesTypeCreateModel } from '$lib/types/priorities.types.js';
import { createOrUpdateSchema } from '$lib/validation/priorities.schema';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside priorities server POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const data: PrioritiesTypeCreateModel = await request.json();

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

		const response = await createPriority(sessionId, data.Type, data.Tags);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating priorities:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
