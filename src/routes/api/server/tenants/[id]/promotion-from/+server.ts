import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { promotion } from '$routes/api/services/reancare/tenant.promotion';
import { getTargetEnvironment } from '$lib/utils/promotion.utils';

export const POST = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const tenantId = event.params.id;

		const targetEnvironment = getTargetEnvironment();

		const response = await promotion(sessionId, tenantId, targetEnvironment);

		return ResponseHandler.success(response);
	} catch (error) {
		return ResponseHandler.handleError(500, null, error);
	}
};