import { ResponseHandler } from '$lib/utils/response.handler';
import type { RequestEvent } from '@sveltejs/kit';
import { userLearningPathParamSchema } from '$lib/validation/lms/user.learning.schema';
import { getLearningPathCompletionState } from '$routes/api/services/lms/user-learnings';

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId || event.request.headers.get('session-id');
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const paramsResult = await userLearningPathParamSchema.safeParseAsync(event.params);
		if (!paramsResult.success) {
			const data = Object.fromEntries(
				Object.entries(paramsResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])
			);
			return ResponseHandler.handleError(400, data, new Error('Validation failed'));
		}

		const { userId, learningPathId } = paramsResult.data;
		const response = await getLearningPathCompletionState(sessionId, userId, learningPathId);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error fetching learning path completion state:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};





