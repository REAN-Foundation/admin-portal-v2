import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

////////////////////////////////////////////////////////////////

export const createExercise = async (
	sessionId: string,
	name: string,
	description: string,
	exerciseType: string,
	intensityLevel: string,
	recommendedDurationMin: number,
	tags: string[],
	version: string
) => {
	const body = {
		Name                  : name,
		Description           : description,
		ExerciseType          : exerciseType,
		IntensityLevel        : intensityLevel,
		RecommendedDurationMin: recommendedDurationMin,
		Tags                  : tags,
		Version               : !version || version?.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + '/assets/exercises';
	const result = await post(sessionId, url, body, true);

	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);
	return result;
};

export const getExerciseById = async (sessionId: string, exerciseId: string) => {
	const cacheKey = `session-${sessionId}:req-getExerciseById-${exerciseId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/exercises/${exerciseId}`;
	const result = await get(sessionId, url, true);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchExercises = async (sessionId: string, searchParams: Record<string, string> = {}) => {
	let searchString = '';
	const keys = Object.keys(searchParams);
	if (keys.length > 0) {
		const params = keys
			.filter((key) => searchParams[key])
			.map((key) => `${key}=${searchParams[key]}`);
		searchString = '?' + params.join('&');
	}

	const cacheKey = `session-${sessionId}:req-searchAssets:exercise:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/exercises/search${searchString}`;
	const result = await get(sessionId, url, true);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateExercise = async (
	sessionId: string,
	exerciseId: string,
	name: string,
	description: string,
	exerciseType: string,
	intensityLevel: string,
	recommendedDurationMin: number,
	tags: string[],
	version: string
) => {
	const body = {
		Name                  : name,
		Description           : description,
		ExerciseType          : exerciseType,
		IntensityLevel        : intensityLevel,
		RecommendedDurationMin: recommendedDurationMin,
		Tags                  : tags,
		Version               : !version || version?.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + `/assets/exercises/${exerciseId}`;
	const result = await put(sessionId, url, body, true);

	await DashboardManager.deleteMany([`session-${sessionId}:req-getExerciseById-${exerciseId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};

export const deleteExercise = async (sessionId: string, exerciseId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/exercises/${exerciseId}`;
	const result = await del(sessionId, url, true);

	await DashboardManager.deleteMany([`session-${sessionId}:req-getExerciseById-${exerciseId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};
