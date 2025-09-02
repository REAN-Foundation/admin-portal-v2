import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { searchAssets } from '$routes/api/services/careplan/assets/asset';
import { createSearchFilters } from '$lib/utils/search.utils';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const assetTypeRoute = event.url.searchParams.get('assetType');
		const searchFilters = createSearchFilters(event, {
			name: event.url.searchParams.get('name') ?? undefined,
			assetCode: event.url.searchParams.get('code') ?? undefined,
		});

		console.log('Search Parameters:', searchFilters);
		const response = await searchAssets(sessionId, assetTypeRoute, searchFilters);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error retrieving asset:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
