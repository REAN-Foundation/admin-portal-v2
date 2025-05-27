import { ResponseHandler } from '$lib/utils/response.handler';
import type { RequestEvent } from '@sveltejs/kit';
import { searchCarePlanActivities } from '$routes/api/services/careplan/scheduling';

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const careplanId = event.url.searchParams.get('careplanId');

		const searchFilters = {
			careplanId: careplanId,
		};

		const response = await searchCarePlanActivities(sessionId, searchFilters);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error retrieving health systems:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
