import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAssetsType } from '../../../../api/services/careplan/assets/asset';
import { searchAssets } from '../../../../api/services/careplan/assets/action-plan';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:assets');

	const response = await searchAssets(sessionId, 'action-plans');
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
