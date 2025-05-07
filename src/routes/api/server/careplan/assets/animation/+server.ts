import { ResponseHandler } from '$lib/utils/response.handler';
import type { RequestEvent } from '@sveltejs/kit';
import { createOrUpdateSchema } from '$lib/validation/animation.schema';
import { createAnimation } from '../../../../services/careplan/assets/animation';
import type { AnimationsCreateModel } from '$lib/types/animation';

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside Animation server POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const data: AnimationsCreateModel = await request.json();

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

		const response = await createAnimation(
			sessionId,
			data.Name,
			data.Transcript,
			data.PathUrl,
			data.Tags,
			data.Version
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating Animation:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
