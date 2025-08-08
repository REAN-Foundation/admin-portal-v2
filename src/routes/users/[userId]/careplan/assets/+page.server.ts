import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAssetsType, searchAssets } from '../../../../api/services/careplan/assets/asset';
import { createSearchFilters } from '$lib/utils/search.utils';
// import { searchAssets } from '../../../../api/services/careplan/assets/action-plan';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:assets');

	const searchFilters = createSearchFilters(event, {
        orderBy: "Name",
        order: "ascending",
        itemsPerPage: 10,
    });
    
    console.log('Search Parameters:', searchFilters);
	const response = await searchAssets(sessionId, 'action-plans', searchFilters);
	const assets = response?.Data || [];
	const assetTypes = await getAssetsType(sessionId);

	console.log('assets==>', assets);

	return {
		assets,
		assetTypes,
		sessionId,
		message: response?.Message || 'Assets retrieved successfully',
		title: 'Action Plans - Assets'
	};
};
