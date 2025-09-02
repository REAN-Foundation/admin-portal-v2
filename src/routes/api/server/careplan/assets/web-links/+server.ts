import type { WebLinksCreateModel } from '$lib/types/web.links';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createOrUpdateSchema } from '$lib/validation/web.links.schema';
import { createWebLink } from '$routes/api/services/careplan/assets/web-link';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside Web-Links server POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const data: WebLinksCreateModel = await request.json();

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

		const response = await createWebLink(
			sessionId,
			data.Name,
			data.Description,
			data.PathUrl,
			data.Tags,
			data.Version,
            data.TenantId
            );
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating Web-links:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
