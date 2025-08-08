import type { RequestEvent } from '@sveltejs/kit';
// import { page } from '$app/stores';
import { searchSymptoms } from '../../../services/reancare/symptoms';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createSearchFilters } from '$lib/utils/search.utils';
// import { BACKEND_API_URL } from '$env/static/private';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const searchFilters = createSearchFilters(event, {
			symptom: event.url.searchParams.get('symptom') ?? undefined,
			tag: event.url.searchParams.get('tags') ?? undefined,
		});

		console.log('Search parms: ', searchFilters);
		const response = await searchSymptoms(sessionId, searchFilters);
		return ResponseHandler.success(response);

		
	} catch (err) {
		console.error(`Error retrieving symptom: ${err.message}`);
		return new Response(err.message);
	}
};
