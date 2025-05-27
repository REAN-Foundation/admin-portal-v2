import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

////////////////////////////////////////////////////////////////

export const createBiometrics = async (
	sessionId: string,
	name: string,
	description: string,
	biometricsType: string,
	measurementUnit: string,
	tags: string[],
	version: string
) => {
	const body = {
		Name            : name,
		Description     : description,
		BiometricsType  : biometricsType,
		MeasurementUnit : measurementUnit,
		Tags            : tags,
		Version         : !version || version?.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + '/assets/biometrics';
	const result = await post(sessionId, url, body, true);

	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};

export const getBiometricsById = async (sessionId: string, biometricsId: string) => {
	const cacheKey = `session-${sessionId}:req-getBiometricsById-${biometricsId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/biometrics/${biometricsId}`;
	const result = await get(sessionId, url, true);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchBiometrics = async (sessionId: string, searchParams: Record<string, string> = {}) => {
	let searchString = '';
	const keys = Object.keys(searchParams);
	if (keys.length > 0) {
		const params = keys
			.filter((key) => searchParams[key])
			.map((key) => `${key}=${searchParams[key]}`);
		searchString = '?' + params.join('&');
	}

	const cacheKey = `session-${sessionId}:req-searchAssets:biometrics:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/biometrics/search${searchString}`;
	const result = await get(sessionId, url, true);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateBiometrics = async (
	sessionId: string,
	biometricsId: string,
	name: string,
	description: string,
	biometricsType: string,
	measurementUnit: string,
	tags: string[],
	version: string
) => {
	const body = {
		Name            : name,
		Description     : description,
		BiometricsType  : biometricsType,
		MeasurementUnit : measurementUnit,
		Tags            : tags,
		Version         : !version || version?.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + `/assets/biometrics/${biometricsId}`;
	const result = await put(sessionId, url, body, true);

	await DashboardManager.deleteMany([`session-${sessionId}:req-getBiometricsById-${biometricsId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};

export const deleteBiometrics = async (sessionId: string, biometricsId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/biometrics/${biometricsId}`;
	const result = await del(sessionId, url, true);

	await DashboardManager.deleteMany([`session-${sessionId}:req-getBiometricsById-${biometricsId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};
