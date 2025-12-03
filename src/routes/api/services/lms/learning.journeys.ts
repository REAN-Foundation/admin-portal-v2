import { LMS_BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from './common.lms';

///////////////////////////////////////////////////////////////////////////////

export const createLearningPath = async (
	sessionId: string,
	tenantId: string,
	name: string,
	description?: string,
	imageUrl?: string,
	durationInDays?: number,
	preferenceWeight?: number,
	enabled?: boolean,
	courseIds?: string[]
) => {
	const body = {
		TenantId: tenantId,
		Name: name,
		Description: description ? description : undefined,
		ImageUrl: imageUrl ? imageUrl : undefined,
		DurationInDays: durationInDays ? durationInDays : undefined,
		PreferenceWeight: preferenceWeight ? preferenceWeight : undefined,
		Enabled: enabled !== undefined ? enabled : undefined,
		CourseIds: courseIds ? courseIds : undefined
	};
	const url = LMS_BACKEND_API_URL + '/learning-paths';
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [`session-${sessionId}:req-searchLearningPaths`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getLearningPathById = async (sessionId: string, id: string) => {
	const url = LMS_BACKEND_API_URL + `/learning-paths/${id}`;

	const cacheKey = `session-${sessionId}:req-getLearningPathById-${id}`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchLearningJourneys = async (sessionId: string, searchParams?) => {
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

	console.log('searchString', searchString);
	const url = LMS_BACKEND_API_URL + `/learning-paths/search${searchString}`;

	const cacheKey = `session-${sessionId}:req-searchLearningPaths:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateLearningPath = async (
	sessionId: string,
	learningPathId: string,
	tenantId: string,
	name: string,
	description?: string,
	imageUrl?: string,
	durationInDays?: number,
	preferenceWeight?: number,
	enabled?: boolean,
	courseIds?: string[]
) => {
	const body = {
		TenantId: tenantId,
		Name: name,
		Description: description ? description : '',
		ImageUrl: imageUrl ? imageUrl : '',
		DurationInDays: durationInDays ? durationInDays : null,
		PreferenceWeight: preferenceWeight ? preferenceWeight : null,
		Enabled: enabled !== undefined ? enabled : null,
		CourseIds: courseIds ? courseIds : null
	};
	const url = LMS_BACKEND_API_URL + `/learning-paths/${learningPathId}`;
	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getLearningPathById-${learningPathId}`];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [`session-${sessionId}:req-searchLearningPaths`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deleteLearningPath = async (sessionId: string, id: string) => {
	const url = LMS_BACKEND_API_URL + `/learning-paths/${id}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getLearningPathById-${id}`];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchLearningPaths`
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};
