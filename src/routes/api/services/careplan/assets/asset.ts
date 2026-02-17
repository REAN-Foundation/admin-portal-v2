import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { get_ } from '../../common';

//////////////////////////////////////////////////////////////////////////////////

export const getAssetsType = async (sessionId: string) => {
	const cacheKey = `session-${sessionId}:req-getAssetsType`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/types/assets`;
	const result = await get_(url, true, sessionId);

	await DashboardManager.set(cacheKey, result);
	return result;
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

	console.log('url-------',url)
	const cacheKey = `session-${sessionId}:req-searchAssets:${assetTypeRoute}:${searchString}`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get_(url, true, sessionId);
	await DashboardManager.set(cacheKey, result);
	return result;
};
