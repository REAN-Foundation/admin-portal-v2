import type { RequestEvent } from '@sveltejs/kit';
import { searchLabRecordTypes } from '../../../services/reancare/lab-record-types';
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
			typeName: event.url.searchParams.get('typeName') ?? undefined,
			displayName: event.url.searchParams.get('displayName') ?? undefined,
		});

		console.log('Search parms: ', searchFilters);
		const response = await searchLabRecordTypes(sessionId, searchFilters);
		// const labRecords = response.Data.LabRecordTypes;
		// console.log('labRecords', JSON.stringify(response, null, 2));
		return new Response(JSON.stringify(response));
	} catch (err) {
		console.error(`Error retrieving lab records: ${err.message}`);
		return new Response(err.message);
	}
};
