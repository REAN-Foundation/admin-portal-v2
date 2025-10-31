import { ResponseHandler } from '$lib/utils/response.handler';
import type { RequestEvent } from '@sveltejs/kit';
import { vectorStorePublish } from '$routes/api/services/bot-content/vectorStore';

///////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside vector store publish server POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const tenantId = event.locals?.sessionUser?.tenantCode;

		const request = event.request;
		const data = await request.json();

		const response = await vectorStorePublish(sessionId, tenantId, data.Version);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error in vector store publish', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
