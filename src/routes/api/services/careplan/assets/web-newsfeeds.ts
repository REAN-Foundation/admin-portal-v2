import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { delete_, get_, post_, put_ } from '../../common';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

////////////////////////////////////////////////////////////////

export const createWebNewsfeed = async (
	sessionId: string,
	name: string,
	description: string,
	pathUrl: string,
	tags: string[],
	version: string,
	tenantId: string
) => {
	const body = {
		Name: name,
		Description: description ? description : null,
		Url: pathUrl ? pathUrl : null,
		Tags: tags ? tags : null,
		TenantId: tenantId,
		Version: !version || version.length === 0 ? 'V 1.0' : version
	};
	const url = CAREPLAN_BACKEND_API_URL + '/assets/web-newsfeeds';
	const result = await post_(url, body, true, sessionId);

	// Clear asset search caches after creation
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};

export const getWebNewsfeedById = async (sessionId: string, webnewsfeedId: string) => {
	const cacheKey = `session-${sessionId}:req-getWebNewsfeedById-${webnewsfeedId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/web-newsfeeds/${webnewsfeedId}`;
	const result = await get_(url, true, sessionId);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchWebNewsfeed = async (
	sessionId: string,
	searchParams: Record<string, string> = {}
) => {
	let searchString = '';
	const keys = Object.keys(searchParams);
	if (keys.length > 0) {
		const params = keys
			.filter((key) => searchParams[key])
			.map((key) => `${key}=${searchParams[key]}`);
		searchString = '?' + params.join('&');
	}

	const cacheKey = `session-${sessionId}:req-searchAssets:web-newsfeed:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/web-newsfeeds/search${searchString}`;
	const result = await get_(url, true, sessionId);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateWebNewsfeed = async (
	sessionId: string,
	webNewsfeedId: string,
	name: string,
	description: string,
	pathUrl: string,
	tags: string[],
	version: string,
	tenantId: string
) => {
	const body = {
		Name: name,
		Description: description ? description : null,
		Url: pathUrl ? pathUrl : null,
		Tags: tags ? tags : null,
		TenantId: tenantId,
		Version: !version || version.length === 0 ? 'V 1.0' : version
	};
	const url = CAREPLAN_BACKEND_API_URL + `/assets/web-newsfeeds/${webNewsfeedId}`;
	const result = await put_(url, body, true, sessionId);

	// Clear cached get-by-id and search results
	await DashboardManager.deleteMany([
		`session-${sessionId}:req-getWebNewsfeedById-${webNewsfeedId}`
	]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};

export const deleteWebNewsfeed = async (sessionId: string, webNewsfeedId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/web-newsfeeds/${webNewsfeedId}`;
	const result = await delete_(url, true, sessionId);

	// Clear cache for that asset and search results
	await DashboardManager.deleteMany([
		`session-${sessionId}:req-getWebNewsfeedById-${webNewsfeedId}`
	]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};
