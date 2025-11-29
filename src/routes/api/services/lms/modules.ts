import { LMS_BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from './common.lms';

///////////////////////////////////////////////////////////////////////////////

export const createModule = async (
	sessionId: string,
	name: string,
	description?: string,
	durationInMins?: number,
	imageUrl?: string,
	sequence?: number,
	courseId?: string,
	// learningPathId?: string,
) => {
	const body = {
		Name: name,
		Description: description ? description : '',
		DurationInMins: durationInMins ? durationInMins : '',
		ImageUrl: imageUrl ? imageUrl : '',
		Sequence: sequence ? sequence : '',
		CourseId: courseId ?? null,
		LearningPathId: '6f91d80b-8e62-4182-b34f-886df053edea',
	};
	const url = LMS_BACKEND_API_URL + '/course-modules';
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [`session-${sessionId}:req-searchModules`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getModuleById = async (sessionId: string, id: string) => {
	const url = LMS_BACKEND_API_URL + `/course-modules/${id}`;

	const cacheKey = `session-${sessionId}:req-getModuleById-${id}`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchModules = async (sessionId: string, searchParams?) => {
	let searchString = '';
	if (searchParams) {
		const keys = Object.keys(searchParams);
		if (keys.length > 0) {
			searchString = '?';
			const params = [];
			for (const key of keys) {
				const value = searchParams[key];
				// Include the parameter if it's not null, undefined, or empty string
				// This ensures courseId and other filters are always included when provided
				if (value !== null && value !== undefined && value !== '') {
					const param = `${key}=${encodeURIComponent(value)}`;
					params.push(param);
				}
			}
			searchString += params.join('&');
		}
	}
	const url = LMS_BACKEND_API_URL + `/course-modules/search${searchString}`;

	const cacheKey = `session-${sessionId}:req-searchModules:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateModule = async (
	sessionId: string,
	moduleId: string,
	name: string,
	description?: string,
	durationInMins?: number,
	imageUrl?: string,
	sequence?: number
) => {
	const body = {
		Name: name,
		Description: description ?? null,
		DurationInMins: durationInMins ?? null,
		ImageUrl: imageUrl ?? null,
		Sequence: sequence ?? null
	};
	const url = LMS_BACKEND_API_URL + `/course-modules/${moduleId}`;
	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getModuleById-${moduleId}`,];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [`session-${sessionId}:req-searchModules`,];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deleteModule = async (sessionId: string, id: string) => {
	const url = LMS_BACKEND_API_URL + `/course-modules/${id}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getModuleById-${id}`,];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchModules`
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

