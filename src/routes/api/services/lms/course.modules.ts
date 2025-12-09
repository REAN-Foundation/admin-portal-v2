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
	// contentSequence?: number,
	courseId?: string,
) => {
	const body = {
		Name: name,
		Description: description ? description : undefined,
		DurationInMins: durationInMins ? durationInMins : undefined,
		ImageUrl: imageUrl ? imageUrl : '',
		// ContentSequence: contentSequence ? contentSequence : null,
		CourseId: courseId ?? null,
	};
	const url = LMS_BACKEND_API_URL + '/course-modules';
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchModules`,
		`session-${sessionId}:req-searchCourses`
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	if (courseId) {
		const courseCacheKey = `session-${sessionId}:req-getCourseById-${courseId}`;
		await DashboardManager.deleteMany([courseCacheKey]);
	}

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
	// contentSequence?: number
) => {
	const body = {
		Name: name,
		Description: description ?? undefined,
		DurationInMins: durationInMins ?? undefined,
		ImageUrl: imageUrl ?? undefined,
		// ContentSequence: contentSequence ?? null
	};
	const url = LMS_BACKEND_API_URL + `/course-modules/${moduleId}`;
	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getModuleById-${moduleId}`,];
	await DashboardManager.deleteMany(keysToBeDeleted);

	// Clear both modules and courses cache since courses include nested modules
	const findAndClearKeys = [
		`session-${sessionId}:req-searchModules`,
		`session-${sessionId}:req-searchCourses`
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deleteModule = async (sessionId: string, id: string) => {
	const url = LMS_BACKEND_API_URL + `/course-modules/${id}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getModuleById-${id}`,];
	await DashboardManager.deleteMany(keysToBeDeleted);

	// Clear both modules and courses cache since courses include nested modules
	const findAndClearKeys = [
		`session-${sessionId}:req-searchModules`,
		`session-${sessionId}:req-searchCourses`
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

