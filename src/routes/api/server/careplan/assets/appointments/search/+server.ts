import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { searchAssets } from '../../../../../services/careplan/assets/action-plan';

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
			code: searchParams.get('code') ?? undefined,
			orderBy: searchParams.get('sortBy') ?? 'CreatedAt',
			order: searchParams.get('sortOrder') ?? 'ascending',
			itemsPerPage: parseInt(searchParams.get('itemsPerPage') ?? '10'),
			pageIndex: parseInt(searchParams.get('pageIndex') ?? '0')
		};

		console.log('Search Parameters:', searchFilters);
		const response = await searchAssets(sessionId, searchFilters);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error retrieving assets:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
