import { ResponseHandler } from '$lib/utils/response.handler';
import type { RequestEvent } from '@sveltejs/kit';
import { userModuleParamSchema } from '$lib/validation/lms/user.learning.schema';
import { getModuleProgress } from '$routes/api/services/lms/user-learnings';

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId || event.request.headers.get('session-id');
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const paramsResult = await userModuleParamSchema.safeParseAsync(event.params);
		if (!paramsResult.success) {
			const data = Object.fromEntries(
				Object.entries(paramsResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])
			);
			return ResponseHandler.handleError(400, data, new Error('Validation failed'));
		}

		const { userId, moduleId } = paramsResult.data;
		const response = await getModuleProgress(sessionId, userId, moduleId);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error fetching module progress:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};





