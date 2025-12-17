import { LMS_BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post } from './common.lms';
import type { EnrollToCourseModel } from '$lib/types/lms/enrollment';

///////////////////////////////////////////////////////////////////////////////

export const enrollToCourse = async (
	sessionId: string,
	userId: string,
	courseId: string,
	startDate?: string,
	expectedEndDate?: string,
) => {
	const body: EnrollToCourseModel = {
		StartDate: startDate,
		ExpectedEndDate: expectedEndDate,
	};
	const url = LMS_BACKEND_API_URL + `/enrollments/users/${userId}/courses/${courseId}`;
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [
		`session-${sessionId}:req-getUserEnrollments-${userId}`,
		`session-${sessionId}:req-getUserActiveEnrollments-${userId}`,
		`session-${sessionId}:req-searchEnrollments`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const enrollToLearningPath = async (
	sessionId: string,
	userId: string,
	learningPathId: string,
) => {
	const url = LMS_BACKEND_API_URL + `/enrollments/users/${userId}/learning-paths/${learningPathId}`;
	const result = await post(sessionId, url, {}, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [
		`session-${sessionId}:req-getUserEnrollments-${userId}`,
		`session-${sessionId}:req-getUserActiveEnrollments-${userId}`,
		`session-${sessionId}:req-searchEnrollments`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getUserActiveEnrollments = async (sessionId: string, userId: string) => {
	const url = LMS_BACKEND_API_URL + `/enrollments/users/${userId}/active`;

	const cacheKey = `session-${sessionId}:req-getUserActiveEnrollments-${userId}`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const getUserEnrollments = async (sessionId: string, userId: string) => {
	const url = LMS_BACKEND_API_URL + `/enrollments/users/${userId}`;

	const cacheKey = `session-${sessionId}:req-getUserEnrollments-${userId}`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const getEnrollmentById = async (sessionId: string, id: string) => {
	const url = LMS_BACKEND_API_URL + `/enrollments/${id}`;

	const cacheKey = `session-${sessionId}:req-getEnrollmentById-${id}`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchEnrollments = async (sessionId: string, searchParams?) => {
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

	const url = LMS_BACKEND_API_URL + `/enrollments/search${searchString}`;

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	return result;
};

export const getActiveEnrollments = async (sessionId: string, tenantId: string) => {
	const url = LMS_BACKEND_API_URL + `/enrollments/tenants/${tenantId}/active`;

	const cacheKey = `session-${sessionId}:req-getActiveEnrollments-${tenantId}`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const deleteEnrollment = async (sessionId: string, id: string) => {
	const url = LMS_BACKEND_API_URL + `/enrollments/${id}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getEnrollmentById-${id}`];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [`session-${sessionId}:req-searchEnrollments`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

