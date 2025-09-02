import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { delete_, get_, post_, put_ } from '../../common';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

////////////////////////////////////////////////////////////////

export const createWordPower = async (
	sessionId: string,
	name: string,
	description: string,
	additionalResources: string[],
	tags: string[],
	version: string,
	tenantId: string
) => {
	const body = {
		Name: name,
		Description: description,
		AdditionalResources: additionalResources,
		Tags: tags,
		TenantId: tenantId,
		Version: !version || version.length === 0 ? 'V 1.0' : version
	};
	const url = CAREPLAN_BACKEND_API_URL + '/assets/word-power';
	const result = await post_(url, body, true, sessionId);

	// Clear asset search caches after creation
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};

export const getWordPowerById = async (sessionId: string, wordPowerId: string) => {
	const cacheKey = `session-${sessionId}:req-getWordPowerById-${wordPowerId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/word-power/${wordPowerId}`;
	const result = await get_(url, true, sessionId);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchWordPower = async (
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

	const cacheKey = `session-${sessionId}:req-searchAssets:word-power:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/word-power/search${searchString}`;
	const result = await get_(url, true, sessionId);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateWordPower = async (
	sessionId: string,
	wordPowerId: string,
	name: string,
	description: string,
	additionalResources: string[],
	tags: string[],
	version: string,
	tenantId: string
) => {
	const body = {
		Name: name,
		Description: description,
		Tags: tags,
		TenantId: tenantId,
		AdditionalResources: additionalResources,
		Version: !version || version.length === 0 ? 'V 1.0' : version
	};
	const url = CAREPLAN_BACKEND_API_URL + `/assets/word-power/${wordPowerId}`;
	const result = await put_(url, body, true, sessionId);

	// Clear cached get-by-id and search results
	await DashboardManager.deleteMany([`session-${sessionId}:req-getWordPowerById-${wordPowerId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};

export const deleteWordPower = async (sessionId: string, wordPowerId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/word-power/${wordPowerId}`;
	const result = await delete_(url, true, sessionId);

	// Clear cache for that asset and search results
	await DashboardManager.deleteMany([`session-${sessionId}:req-getWordPowerById-${wordPowerId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};
