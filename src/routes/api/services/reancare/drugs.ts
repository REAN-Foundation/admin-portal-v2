import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createDrug = async (
	sessionId: string,
	drugName: string,
	genericName: string,
	ingredients: string,
	strength: string,
	otherCommercialNames: string,
	manufacturer: string,
	otherInformation: string
) => {
	const body = {
		DrugName: drugName,
		GenericName: genericName ?? null,
		Ingredients: ingredients ?? null,
		Strength: strength ?? null,
		OtherCommercialNames: otherCommercialNames ?? null,
		Manufacturer: manufacturer ?? null,
		OtherInformation: otherInformation ?? null
	};
	const url = BACKEND_API_URL + '/clinical/drugs';
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [`session-${sessionId}:req-searchDrugs`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getDrugById = async (sessionId: string, drugId: string) => {
	const url = BACKEND_API_URL + `/clinical/drugs/${drugId}`;
	const cacheKey = `session-${sessionId}:req-getDrugById-${drugId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchDrugs = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/clinical/drugs/search${searchString}`;
	const cacheKey = `session-${sessionId}:req-searchDrugs:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateDrug = async (
	sessionId: string,
	drugId: string,
	drugName: string,
	genericName: string,
	ingredients: string,
	strength: string,
	otherCommercialNames: string,
	manufacturer: string,
	otherInformation: string
) => {
	const body = {
		DrugName: drugName,
		GenericName: genericName ?? '',
		Ingredients: ingredients ?? '',
		Strength: strength ?? '',
		OtherCommercialNames: otherCommercialNames ?? '',
		Manufacturer: manufacturer ?? '',
		OtherInformation: otherInformation ?? ''
	};
	const url = BACKEND_API_URL + `/clinical/drugs/${drugId}`;
	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getDrugById-${drugId}`];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [`session-${sessionId}:req-searchDrugs`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deleteDrug = async (sessionId: string, drugId: string) => {
	const url = BACKEND_API_URL + `/clinical/drugs/${drugId}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getDrugById-${drugId}`];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [`session-${sessionId}:req-searchDrugs`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};
