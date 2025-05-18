import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

////////////////////////////////////////////////////////////////

export const createInfographics = async (
	sessionId: string,
	name: string,
	description: string,
	pathUrl: string,
	tags: string[],
	version: string
) => {
	const body = {
		Name        : name,
		Description : description,
		Url         : pathUrl,
		Tags        : tags,
		Version     : !version || version?.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + '/assets/infographics';
	const result = await post(sessionId, url, body, true);

	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);
	return result;
};

export const getInfographicsById = async (sessionId: string, infographicsId: string) => {
	const cacheKey = `session-${sessionId}:req-getInfographicsById-${infographicsId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/infographics/${infographicsId}`;
	const result = await get(sessionId, url, true);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchInfographics = async (sessionId: string, searchParams: Record<string, string> = {}) => {
	let searchString = '';
	const keys = Object.keys(searchParams);
	if (keys.length > 0) {
		const params = keys
			.filter((key) => searchParams[key])
			.map((key) => `${key}=${searchParams[key]}`);
		searchString = '?' + params.join('&');
	}

	const cacheKey = `session-${sessionId}:req-searchAssets:infographic:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/infographics/search${searchString}`;
	const result = await get(sessionId, url, true);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateInfographics = async (
	sessionId: string,
	infographicsId: string,
	name: string,
	description: string,
	pathUrl: string,
	tags: string[],
	version: string
) => {
	const body = {
		Name        : name,
		Description : description,
		Url         : pathUrl,
		Tags        : tags,
		Version     : !version || version?.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + `/assets/infographics/${infographicsId}`;
	const result = await put(sessionId, url, body, true);

	await DashboardManager.deleteMany([`session-${sessionId}:req-getInfographicsById-${infographicsId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};

export const deleteInfographics = async (sessionId: string, infographicsId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/infographics/${infographicsId}`;
	const result = await del(sessionId, url, true);

	await DashboardManager.deleteMany([`session-${sessionId}:req-getInfographicsById-${infographicsId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};
