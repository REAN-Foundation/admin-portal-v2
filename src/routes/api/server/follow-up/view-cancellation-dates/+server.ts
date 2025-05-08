import { ResponseHandler } from '$lib/utils/response.handler';
import { viewCancelDates } from '$routes/api/services/follow-up/reminders';
import type { RequestEvent } from '@sveltejs/kit';

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const searchParams: URLSearchParams = event.url.searchParams;
		const searchFilters = {
			startDate: searchParams.get('startDate') ?? undefined,
			endDate: searchParams.get('endDate') ?? undefined
		};

		console.log('Search Parameters:', searchFilters);
		const response = await viewCancelDates(sessionId, searchFilters);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error retrieving health systems:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
