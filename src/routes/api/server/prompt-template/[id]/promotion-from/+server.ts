import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { llmPromptPromotion } from '$routes/api/services/bot-content/prompt-template';
import { getTargetEnvironment } from '$lib/utils/promotion.utils';

export const POST = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		const tenantCode = event.locals?.sessionUser?.tenantCode;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const promptId = event.params.id;
		const targetEnvironment = getTargetEnvironment();
		const response = await llmPromptPromotion(sessionId, promptId, targetEnvironment, tenantCode);

		return ResponseHandler.success(response);
	} catch (error) {
		return ResponseHandler.handleError(500, null, error);
	}
};
