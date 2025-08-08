import type { RequestEvent } from '@sveltejs/kit';
import { searchHospitals } from '../../../services/reancare/hospitals';
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
			name: event.url.searchParams.get('name') ?? undefined,
			tags: event.url.searchParams.get('tags') ?? undefined,
			// healthSystemName: event.url.searchParams.get('healthSystemName') ?? undefined,
		});

		console.log('Search parms: ', searchFilters);
		const response = await searchHospitals(sessionId, searchFilters);
		return new Response(JSON.stringify(response));
	} catch (err) {
		console.error(`Error retrieving hospitals: ${err.message}`);
		return new Response(err.message);
	}
};
