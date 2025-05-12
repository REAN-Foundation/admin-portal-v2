import { API_CLIENT_INTERNAL_KEY, CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { get_ } from '../../common';
import { get } from '../../reancare/common.reancare';

//////////////////////////////////////////////////////////////////////////////////

export const getAssetsType = async (sessionId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/types/assets`;
	return await get_(url, true, sessionId);
};

export const searchAssets = async (
	sessionId?: string,
	assetTypeRoute?: string,
	searchParams?: any
) => {
	let searchString = '';
	if (searchParams) {
		const keys = Object.keys(searchParams);
		if (keys.length > 0) {
			searchString = '?';
			const params = [];
			for (const key of keys) {
				if (searchParams[key]) {
					const param = `${key}=${searchParams[key]}`;
					params.push(param);
				}
			}
			searchString += params.join('&');
		}
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/${assetTypeRoute}/search${searchString}`;
	console.log('mainurl', url);

	const cacheKey = `session-${sessionId}:req-searchAssets:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};
