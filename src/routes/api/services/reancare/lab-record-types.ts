import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createLabRecordType = async (
	sessionId: string,
	typeName: string,
	displayName: string,
	snowmedCode: string,
	loincCode: string,
	normalRangeMin: number,
	normalRangeMax: number,
	unit: string
) => {
	const body = {
		TypeName: typeName,
		DisplayName: displayName ? displayName : null,
		SnowmedCode: snowmedCode ? snowmedCode : null,
		LoincCode: loincCode ? loincCode : null,
		NormalRangeMin: normalRangeMin ? normalRangeMin : 0.0,
		NormalRangeMax: normalRangeMax ? normalRangeMax : 0.0,
		Unit: unit ? unit : null
	};
	const url = BACKEND_API_URL + '/types/lab-records';
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchLabRecordTypes`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getLabRecordTypeById = async (sessionId: string, labRecordTypeId: string) => {
	const url = BACKEND_API_URL + `/types/lab-records/${labRecordTypeId}`;
	const cacheKey = `session-${sessionId}:req-getLabRecordTypeById-${labRecordTypeId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchLabRecordTypes = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/types/lab-records/search${searchString}`;
	const cacheKey = `session-${sessionId}:req-searchLabRecordTypes:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateLabRecordType = async (
	sessionId: string,
	labRecordTypeId: string,
	typeName: string,
	displayName: string,
	snowmedCode: string,
	loincCode: string,
	normalRangeMin: number,
	normalRangeMax: number,
	unit: string
) => {
	const body = {
		TypeName: typeName,
		DisplayName: displayName ? displayName : null,
		SnowmedCode: snowmedCode ? snowmedCode : '',
		LoincCode: loincCode ? loincCode : '',
		NormalRangeMin: normalRangeMin ? normalRangeMin : 0.0,
		NormalRangeMax: normalRangeMax ? normalRangeMax : 0.0,
		Unit: unit ? unit : ''
	};
	const url = BACKEND_API_URL + `/types/lab-records/${labRecordTypeId}`;
	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
	const keysToBeDeleted = [
		`session-${sessionId}:req-getLabRecordTypeById-${labRecordTypeId}`,
	];
	await DashboardManager.deleteMany(keysToBeDeleted);
	const findAndClearKeys = [
		`session-${sessionId}:req-searchLabRecordTypes`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deleteLabRecordType = async (sessionId: string, labRecordTypeId: string) => {
	const url = BACKEND_API_URL + `/types/lab-records/${labRecordTypeId}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [
		`session-${sessionId}:req-getLabRecordTypeById-${labRecordTypeId}`,
	];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchLabRecordTypes`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};
