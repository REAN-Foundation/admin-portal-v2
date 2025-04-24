import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createGoal = async (sessionId: string, type: string, tags: string[]) => {
	const body = {
		Type: type,
		Tags: tags ? tags : null
	};
	const url = BACKEND_API_URL + '/types/goal-types';
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getGoalById = async (sessionId: string, goalId: string) => {
	const url = BACKEND_API_URL + `/types/goal-types/${goalId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const searchGoals = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/types/goal-types/search${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updateGoal = async (
	sessionId: string,
	goalId: string,
	type: string,
	tags: string[]
) => {
	const body = {
		Type: type,
		Tags: tags ? tags : null
	};
	const url = BACKEND_API_URL + `/types/goal-types/${goalId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteGoal = async (sessionId: string, goalId: string) => {
	const url = BACKEND_API_URL + `/types/goal-types/${goalId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
