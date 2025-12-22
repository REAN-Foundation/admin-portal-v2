import { LMS_BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { get, put } from './common.lms';
import type { UpdateUserLearningModel } from '$lib/types/lms/user-learning';

///////////////////////////////////////////////////////////////////////////////

const userLearningCachePrefix = (sessionId: string, userId: string) =>
	`session-${sessionId}:req-user-learning-${userId}`;

export const updateUserLearning = async (
	sessionId: string,
	userId: string,
	learningPathId: string,
	contentId: string,
	body: UpdateUserLearningModel
) => {
	const url =
		LMS_BACKEND_API_URL +
		`/user-learnings/${userId}/learning-paths/${learningPathId}/contents/${contentId}`;

	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	await DashboardManager.findAndClear([userLearningCachePrefix(sessionId, userId)]);
	return result;
};

export const getUserLearningPaths = async (sessionId: string, userId: string) => {
	const url = LMS_BACKEND_API_URL + `/user-learnings/${userId}/learning-paths`;
	const cacheKey = `${userLearningCachePrefix(sessionId, userId)}:learning-paths`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const getUserCourses = async (sessionId: string, userId: string) => {
	const url = LMS_BACKEND_API_URL + `/user-learnings/${userId}/courses`;
	const cacheKey = `${userLearningCachePrefix(sessionId, userId)}:courses`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const getLearningPathProgress = async (
	sessionId: string,
	userId: string,
	learningPathId: string
) => {
	const url =
		LMS_BACKEND_API_URL +
		`/user-learnings/${userId}/learning-paths/${learningPathId}/progress`;
	const cacheKey = `${userLearningCachePrefix(sessionId, userId)}:learning-path:${learningPathId}:progress`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const getCourseProgress = async (sessionId: string, userId: string, courseId: string) => {
	const url = LMS_BACKEND_API_URL + `/user-learnings/${userId}/courses/${courseId}/progress`;
	const cacheKey = `${userLearningCachePrefix(sessionId, userId)}:course:${courseId}:progress`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const getModuleProgress = async (sessionId: string, userId: string, moduleId: string) => {
	const url = LMS_BACKEND_API_URL + `/user-learnings/${userId}/modules/${moduleId}/progress`;
	const cacheKey = `${userLearningCachePrefix(sessionId, userId)}:module:${moduleId}:progress`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const getContentProgress = async (sessionId: string, userId: string, contentId: string) => {
	const url = LMS_BACKEND_API_URL + `/user-learnings/${userId}/contents/${contentId}/progress`;
	const cacheKey = `${userLearningCachePrefix(sessionId, userId)}:content:${contentId}:progress`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const getLearningPathCompletionState = async (
	sessionId: string,
	userId: string,
	learningPathId: string
) => {
	const url =
		LMS_BACKEND_API_URL +
		`/user-learnings/${userId}/learning-paths/${learningPathId}/completion-state`;
	const cacheKey = `${userLearningCachePrefix(sessionId, userId)}:learning-path:${learningPathId}:completion-state`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const getCourseCompletionState = async (
	sessionId: string,
	userId: string,
	courseId: string
) => {
	const url =
		LMS_BACKEND_API_URL + `/user-learnings/${userId}/courses/${courseId}/completion-state`;
	const cacheKey = `${userLearningCachePrefix(sessionId, userId)}:course:${courseId}:completion-state`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const getModuleCompletionState = async (
	sessionId: string,
	userId: string,
	moduleId: string
) => {
	const url =
		LMS_BACKEND_API_URL + `/user-learnings/${userId}/modules/${moduleId}/completion-state`;
	const cacheKey = `${userLearningCachePrefix(sessionId, userId)}:module:${moduleId}:completion-state`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const getContentCompletionState = async (
	sessionId: string,
	userId: string,
	contentId: string
) => {
	const url =
		LMS_BACKEND_API_URL + `/user-learnings/${userId}/contents/${contentId}/completion-state`;
	const cacheKey = `${userLearningCachePrefix(sessionId, userId)}:content:${contentId}:completion-state`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};





