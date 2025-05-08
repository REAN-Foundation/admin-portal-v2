import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { searchAssets } from '$routes/api/services/careplan/assets/asset';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const searchParams: URLSearchParams = event.url.searchParams;
		const searchFilters = {
			assetName: searchParams.get('name') ?? undefined,
			assetCode: searchParams.get('code') ?? undefined,
			asseType: searchParams.get('type') ?? undefined,
			orderBy: searchParams.get("sortBy") ?? "CreatedAt",
			order: searchParams.get("sortOrder") ?? "ascending",
			itemsPerPage: parseInt(searchParams.get("itemsPerPage") ?? "10"),
			pageIndex: parseInt(searchParams.get("pageIndex") ?? "0"),
		};

		console.log('Search parms: ', searchFilters);
		const selectAsset = event.url.searchParams.get('assetType');
		console.log(selectAsset,"in select Asset")
		const response = await searchAssets(sessionId,selectAsset, searchFilters);



		return ResponseHandler.success(response);
	} catch (err) {
		console.error(`Error retriving assets: ${err.message}`);
		return new Response(err.message);
	}
};
