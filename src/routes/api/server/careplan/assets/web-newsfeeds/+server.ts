import type { WebNewsfeedsCreateModel } from '$lib/types/web.newsfeeds';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createOrUpdateSchema } from '$lib/validation/web.newsfeeds.schema';
import { createWebNewsfeed } from '$routes/api/services/careplan/assets/web-newsfeeds';

import type { RequestEvent } from '@sveltejs/kit';

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside Web-Newsfeeds server POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const data: WebNewsfeedsCreateModel = await request.json();

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

		const response = await createWebNewsfeed(
			sessionId,
			data.Name,
			data.Description,
			data.PathUrl,
			data.Tags,
			data.Version
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating Web-Newsfeeds:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
