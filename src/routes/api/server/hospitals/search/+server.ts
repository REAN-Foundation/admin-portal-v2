import type { RequestEvent } from '@sveltejs/kit';
import { searchHospitals } from '../../../services/reancare/hospitals';
import { ResponseHandler } from '$lib/utils/response.handler';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}
		const searchParams: URLSearchParams = event.url.searchParams;
		const searchFilters = {
			name: searchParams.get('name') ?? undefined,
			tags: searchParams.get('tags') ?? undefined,
		//  healthSystemName : searchParams.get('healthSystemName') ?? undefined,
			orderBy: searchParams.get('sortBy') ?? 'CreatedAt',
			order: searchParams.get('sortOrder') ?? 'ascending',
			itemsPerPage: parseInt(searchParams.get('itemsPerPage') ?? '10'),
			pageIndex: parseInt(searchParams.get('pageIndex') ?? '0')
		};

		console.log('Search parms: ', searchFilters);
		const response = await searchHospitals(sessionId, searchFilters);
		return new Response(JSON.stringify(response));
	} catch (err) {
		console.error(`Error retriving careplans: ${err.message}`);
		return new Response(err.message);
	}
};
