import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createSearchFilters } from '$lib/utils/search.utils';

import { searchActionplans } from '../../../../../services/careplan/assets/action-plan';
// import { searchAssets } from '../../../../../services/careplan/assets/action-plan';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const searchFilters = createSearchFilters(event, {
			name: event.url.searchParams.get('name') ?? undefined,
			code: event.url.searchParams.get('code') ?? undefined,
		});

		console.log('Search Parameters:', searchFilters);
		// const assetType = searchParams.get('assetType');
		const response = await searchActionplans(sessionId, searchFilters);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error retrieving action plans:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
