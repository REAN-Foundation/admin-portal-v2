import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { del, get, post, put } from './common.reancare';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

////////////////////////////////////////////////////////////////

export const createHospital = async (
	sessionId: string,
	name: string,
	healthSystemId: string,
	tags: string[]
) => {
	const body = {
		Name: name,
		HealthSystemId: healthSystemId ? healthSystemId : null,
		Tags: tags ? tags : []
	};
	const url = BACKEND_API_URL + '/hospitals';
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchHospitals`
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getHospitalById = async (sessionId: string, hospitalId: string) => {
	const url = BACKEND_API_URL + `/hospitals/${hospitalId}`;
	const cacheKey = `session-${sessionId}:req-getHospitalById-${hospitalId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchHospitals = async (sessionId: string, searchParams?) => {
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
	const url = BACKEND_API_URL + `/hospitals/search${searchString}`;
	const cacheKey = `session-${sessionId}:req-searchHospitals:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateHospital = async (
	sessionId: string,
	hospitalId: string,
	name: string,
	healthSystemId: string,
	tags: string[]
) => {
	const body = {
		hospitalId,
		Name: name,
		HealthSystemId: healthSystemId ? healthSystemId : null,
		Tags: tags ? tags : null
	};
	console.log("body", body);

	const url = BACKEND_API_URL + `/hospitals/${hospitalId}`;
	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
	const keysToBeDeleted = [
		`session-${sessionId}:req-getHospitalById-${hospitalId}`,
	];
	await DashboardManager.deleteMany(keysToBeDeleted);
	const findAndClearKeys = [
		`session-${sessionId}:req-searchHospitals`,
		`session-${sessionId}:req-getHospitalsForHealthSystem`
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deleteHospital = async (sessionId: string, hospitalId: string) => {
	const url = BACKEND_API_URL + `/hospitals/${hospitalId}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [
		`session-${sessionId}:req-getHospitalById-${hospitalId}`,
	];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchHospitals`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getHospitalsForHealthSystem = async (sessionId: string, healthSystemId: string) => {
	const url = BACKEND_API_URL + `/hospitals/health-systems/${healthSystemId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
