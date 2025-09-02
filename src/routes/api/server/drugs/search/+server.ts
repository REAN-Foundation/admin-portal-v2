import type { RequestEvent } from '@sveltejs/kit';
import { searchDrugs } from '../../../services/reancare/drugs';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createSearchFilters } from '$lib/utils/search.utils';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const searchFilters = createSearchFilters(event, {
			name: event.url.searchParams.get('drugName') ?? undefined,
			genericName: event.url.searchParams.get('genericName') ?? undefined,
		});

		console.log('Search parms: ', searchFilters);
		const response = await searchDrugs(sessionId, searchFilters);

		return ResponseHandler.success(response);
	} catch (err) {
		console.error(`Error retrieving drugs: ${err.message}`);
		return new Response(err.message);
	}
};
