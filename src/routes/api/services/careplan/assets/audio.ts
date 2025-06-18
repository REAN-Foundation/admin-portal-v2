import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

////////////////////////////////////////////////////////////////

export const createAudio = async (
	sessionId: string,
	name: string,
	transcript: string,
	pathUrl: string,
	tags: string[],
	version: string,
	tenantId: string,
) => {
	const body = {
		Name       : name,
		Transcript : transcript,
		Url        : pathUrl,
		Tags       : tags,
		TenantId   : tenantId,
		Version    : !version || version?.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + '/assets/audio';
	const result = await post(sessionId, url, body, true);

	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);
	return result;
};

export const getAudioById = async (sessionId: string, audioId: string) => {
	const cacheKey = `session-${sessionId}:req-getAudioById-${audioId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/audio/${audioId}`;
	const result = await get(sessionId, url, true);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchAudio = async (sessionId: string, searchParams: Record<string, string> = {}) => {
	let searchString = '';
	const keys = Object.keys(searchParams);
	if (keys.length > 0) {
		const params = keys
			.filter((key) => searchParams[key])
			.map((key) => `${key}=${searchParams[key]}`);
		searchString = '?' + params.join('&');
	}

	const cacheKey = `session-${sessionId}:req-searchAssets:audio:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/audio/search${searchString}`;
	const result = await get(sessionId, url, true);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateAudio = async (
	sessionId: string,
	audioId: string,
	name: string,
	transcript: string,
	pathUrl: string,
	tags: string[],
	version: string,
	tenantId: string
) => {
	const body = {
		Name       : name,
		Transcript : transcript,
		Url        : pathUrl,
		Tags       : tags,
		TenantId   : tenantId,
		Version    : !version || version?.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + `/assets/audio/${audioId}`;
	const result = await put(sessionId, url, body, true);

	await DashboardManager.deleteMany([`session-${sessionId}:req-getAudioById-${audioId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};

export const deleteAudio = async (sessionId: string, audioId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/audio/${audioId}`;
	const result = await del(sessionId, url, true);

	await DashboardManager.deleteMany([`session-${sessionId}:req-getAudioById-${audioId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};
