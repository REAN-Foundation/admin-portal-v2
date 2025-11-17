import { ResponseHandler } from '$lib/utils/response.handler';
import type { RequestEvent } from '@sveltejs/kit';
import { vectorStoreRefresh } from '$routes/api/services/bot-content/vectorStore';

///////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside vector store refresh server POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}
		const request = event.request;
		const data = await request.json();
		const tenantId = event.locals?.sessionUser?.tenantCode;

		const response = await vectorStoreRefresh(sessionId, tenantId);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error in vector store refresh', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
