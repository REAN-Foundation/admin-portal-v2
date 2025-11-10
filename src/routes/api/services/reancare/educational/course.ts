import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from '../common.reancare';

////////////////////////////////////////////////////////////////

export const createCourse = async (
	sessionId: string,
	name: string,
	description?: string,
	imageResourceId?: string,
	durationInDays?: number
) => {
	const body = {
		Name: name,
		Description: description || null,
		ImageResourceId: imageResourceId || null,
		DurationInDays: durationInDays || null
	};
	const url = BACKEND_API_URL + '/educational/courses';
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [`session-${sessionId}:req-searchCourses`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getCourseById = async (sessionId: string, id: string) => {
	const url = BACKEND_API_URL + `/educational/courses/${id}`;
	console.log("URL*****", url);

	const cacheKey = `session-${sessionId}:req-getCourseById-${id}`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchCourses = async (sessionId: string, searchParams?) => {
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
	const url = BACKEND_API_URL + `/educational/courses/search${searchString}`;

	const cacheKey = `session-${sessionId}:req-searchCourses:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateCourse = async (
	sessionId: string,
	courseId: string,
	name: string,
	description?: string,
	imageResourceId?: string,
	durationInDays?: number
) => {
	const body = {
		courseId,
		Name: name,
		Description: description || null,
		ImageResourceId: imageResourceId || null,
		DurationInDays: durationInDays || null
	};
	const url = BACKEND_API_URL + `/educational/courses/${courseId}`;
	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getCourseById-${courseId}`,];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [`session-${sessionId}:req-searchCourses`,];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deleteCourse = async (sessionId: string, id: string) => {
	const url = BACKEND_API_URL + `/educational/courses/${id}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getCourseById-${id}`,];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchCourses`
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

