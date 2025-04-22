import type { RequestEvent } from '@sveltejs/kit';
import { searchDrugs } from '../../../services/reancare/drugs';
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
			drugName: searchParams.get('drugName') ?? undefined,
			genericName: searchParams.get('genericName') ?? undefined,
			sortBy: searchParams.get('sortBy') ?? 'CreatedAt',
			sortOrder: searchParams.get('sortOrder') ?? 'ascending',
			itemsPerPage: parseInt(searchParams.get('itemsPerPage') ?? '25'),
			pageIndex: parseInt(searchParams.get('pageIndex') ?? '0')
		};

		console.log('Search parms: ', searchParams);
		const response = await searchDrugs(sessionId, searchFilters);
		// const items = response.Data.Drugs;
		// console.log('res==', response);

		return ResponseHandler.success(response);
	} catch (err) {
		console.error(`Error retriving drugs: ${err.message}`);
		return new Response(err.message);
	}
};
