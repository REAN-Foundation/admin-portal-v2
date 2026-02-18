import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { careplanPromotion } from '$routes/api/services/reancare/careplan.promotion';
import { getTargetEnvironment } from '$lib/utils/promotion.utils';

export const POST = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
        const tenantCode = event.locals?.sessionUser?.tenantCode;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const careplanId = event.params.id;
		const targetEnvironment = getTargetEnvironment();

        console.log(`Promoting care plan with ID: ${careplanId} to environment: ${targetEnvironment}`);
		const response = await careplanPromotion(sessionId, careplanId, targetEnvironment, tenantCode);

		return ResponseHandler.success(response);
	} catch (error) {
		return ResponseHandler.handleError(500, null, error);
	}
};
