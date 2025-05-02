import type { RequestEvent } from '@sveltejs/kit';
import { searchAssets } from '../../../../services/careplan/assets/asset';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	// const request = event.request;
	const sessionId = event.locals.sessionUser.sessionId;
	console.log('sessionId', sessionId);
	const searchParams: URLSearchParams = event.url.searchParams;
	const assetTypeRoute = searchParams.get('assetType');
	console.log('assetTypeRoute', assetTypeRoute);
	const assetName = searchParams.get('assetName') ?? undefined;
	const assetCode = searchParams.get('assetCode') ?? undefined;
	// const carePlan = searchParams.get('carePlan') ?? undefined;
	const sortBy = searchParams.get('sortBy') ?? 'CreatedAt';
	const sortOrder = searchParams.get('sortOrder') ?? 'ascending';
	const itemsPerPage_ = searchParams.get('itemsPerPage');
	const itemsPerPage = itemsPerPage_ ? parseInt(itemsPerPage_) : 10;
	const pageIndex_ = searchParams.get('pageIndex');
	const pageIndex = pageIndex_ ? parseInt(pageIndex_) : 0;
	try {
		const searchParams = {
			name: assetName,
			assetCode,
			orderBy: sortBy,
			order: sortOrder,
			itemsPerPage,
			pageIndex
		};
		const response = await searchAssets(sessionId, assetTypeRoute, searchParams);
		const items = response.Data.Items;

		return new Response(JSON.stringify(items));
	} catch (err) {
		console.error(`Error retriving asset: ${err.message}`);
		return new Response(err.message);
	}
};
