import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createSymptom = async (
	sessionId: string,
	symptom: string,
	description: string,
	tags: string[],
	language: string,
	imageResourceId: string
) => {
	const body = {
		Symptom: symptom,
		Description: description ?? null,
		Tags: tags ?? null,
		Language: language,
		ImageResourceId: imageResourceId
	};
	const url = BACKEND_API_URL + '/clinical/symptom-types';
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [`session-${sessionId}:req-searchSymptoms`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getSymptomById = async (sessionId: string, symptomId: string) => {
	const url = BACKEND_API_URL + `/clinical/symptom-types/${symptomId}`;
	const cacheKey = `session-${sessionId}:req-getSymptomById-${symptomId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchSymptoms = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/clinical/symptom-types/search${searchString}`;
	const cacheKey = `session-${sessionId}:req-searchSymptoms:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateSymptom = async (
	sessionId: string,
	symptomId: string,
	symptom: string,
	description: string,
	tags: string[],
	language: string,
	imageResourceId: string
) => {
	const body = {
		Symptom: symptom,
		Description: description ?? null,
		Tags: tags ?? null,
		Language: language,
		ImageResourceId: imageResourceId
	};
	const url = BACKEND_API_URL + `/clinical/symptom-types/${symptomId}`;
	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getSymptomById-${symptomId}`];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [`session-${sessionId}:req-searchSymptoms`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deleteSymptom = async (sessionId: string, symptomId: string) => {
	const url = BACKEND_API_URL + `/clinical/symptom-types/${symptomId}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getSymptomById-${symptomId}`];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [`session-${sessionId}:req-searchSymptoms`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};
