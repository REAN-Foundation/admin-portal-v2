import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchPatients } from '$routes/api/services/reancare/paitents';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const searchFilters = createSearchFilters(event, {
			phone: event.url.searchParams.get('phone') ?? undefined,
			name: event.url.searchParams.get('name') ?? undefined,
		});

		console.log('Patient Search Parameters:', searchFilters);
		console.log('Phone parameter:', event.url.searchParams.get('phone'));
		console.log('Search parms: ', searchFilters);
		const response = await searchPatients(sessionId, searchFilters);
	
		return ResponseHandler.success(response);																																																																												  																		
	} catch (error) {
		console.error('Error retrieving patients:', error);
		return ResponseHandler.handleError(500, null, error);
	}
}; 