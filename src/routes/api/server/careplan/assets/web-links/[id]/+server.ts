import type { WebLinksUpdateModel } from '$lib/types/web.links';
import { ResponseHandler } from '$lib/utils/response.handler';
import { uuidSchema } from '$lib/validation/common.schema';
import { createOrUpdateSchema } from '$lib/validation/web.links.schema';
import {
	deleteWebLink,
	getWebLinkById,
	updateWebLink
} from '$routes/api/services/careplan/assets/web-link';
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

		const webLinkId = event.params.webLinkId;

		const response = await deleteWebLink(sessionId, webLinkId);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error deleting web-link:', error);
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

		const response = await getWebLinkById(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error fetching web-link:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const PUT = async (event: RequestEvent) => {
	try {
		console.log('Inside web-link server PUT endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const webLinkId = event.params.id;
		const request = event.request;
		const data: WebLinksUpdateModel = await request.json();

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

		const response = await updateWebLink(
			sessionId,
			webLinkId,
			data.Name,
			data.Description,
			data.PathUrl,
			data.Tags,
			data.Version,
            data.TenantId
            );
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error updating Web-link:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
