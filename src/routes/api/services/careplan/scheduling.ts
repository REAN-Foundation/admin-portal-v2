import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from './common.careplan';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

//////////////////////////////////////////////////////////////////

export const createCarePlanActivity = async (
	sessionId: string,
	assetType: string,
	assetId_: string,
	careplanId: string,
	day: number,
	timeSlot: string,
	sequence?: number
) => {
	const url = CAREPLAN_BACKEND_API_URL + '/careplan-activities';
	const body = {
		AssetType: assetType,
		AssetId: assetId_,
		CareplanId: careplanId,
		Day: day,
		TimeSlot: timeSlot,
		...(sequence !== undefined && sequence !== null && { Sequence: sequence })
	};
	const result = await post(sessionId, url, body, true);

	const findAndClearKeys = [`session-${sessionId}:req-CareplanActivities`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getCarePlanActivityById = async (sessionId: string, careplanActivityId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/careplan-activities/${careplanActivityId}`;
	const cacheKey = `session-${sessionId}:req-getCarePlanActivityById-${careplanActivityId}`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true);
	await DashboardManager.set(cacheKey, result);

	return result;
};

export const searchCarePlanActivities = async (sessionId: string, searchParams?: any) => {
	let searchString = '';
	if (searchParams) {
		const keys = Object.keys(searchParams);
		if (keys.length > 0) {
			searchString = '?';
			const params = [];
			for (const key of keys) {
				if (searchParams[key]) {
					params.push(`${key}=${searchParams[key]}`);
				}
			}
			searchString += params.join('&');
		}
	}
	const url = CAREPLAN_BACKEND_API_URL + `/careplan-activities/search${searchString}`;
	const cacheKey = `session-${sessionId}:req-CareplanActivities:${searchString}`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true);
	await DashboardManager.set(cacheKey, result);

	return result;
};

export const updateCarePlanActivity = async (
	sessionId: string,
	careplanActivityId: string,
	assetType: string,
	assetId_: string,
	careplanId: string,
	day: number,
	timeSlot: string,
	sequence?: number
) => {
	const url = CAREPLAN_BACKEND_API_URL + `/careplan-activities/${careplanActivityId}`;
	const body = {
		AssetType: assetType,
		AssetId: assetId_,
		CareplanId: careplanId,
		Day: day,
		TimeSlot: timeSlot,
		...(sequence !== undefined && sequence !== null && { Sequence: sequence })
	};
	const result = await put(sessionId, url, body, true);

	const keysToDelete = [`session-${sessionId}:req-getCarePlanActivityById-${careplanActivityId}`];
	await DashboardManager.deleteMany(keysToDelete);

	const findAndClearKeys = [`session-${sessionId}:req-CareplanActivities`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deleteCarePlanActivity = async (sessionId: string, careplanActivityId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/careplan-activities/${careplanActivityId}`;
	const result = await del(sessionId, url, true);

	const keysToDelete = [`session-${sessionId}:req-getCarePlanActivityById-${careplanActivityId}`];
	await DashboardManager.deleteMany(keysToDelete);

	const findAndClearKeys = [`session-${sessionId}:req-CareplanActivities`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const searchCareplanCategories = async (sessionId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/careplan-categories/search`;
	const cacheKey = `session-${sessionId}:req-searchCareplanCategories`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true);
	await DashboardManager.set(cacheKey, result);

	return result;
};
