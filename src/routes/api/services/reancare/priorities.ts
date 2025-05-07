import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createPriority = async (sessionId: string, type: string, tags: string[]) => {
	const body = {
		Type: type,
		Tags: tags ? tags : []
	};
	const url = BACKEND_API_URL + '/types/priorities';
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getPriorityById = async (sessionId: string, priorityId: string) => {
	const url = BACKEND_API_URL + `/types/priorities/${priorityId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const searchPriorities = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/types/priorities/search${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updatePriority = async (
	sessionId: string,
	priorityId: string,
	type: string,
	tags: string[]
) => {
	const body = {
		priorityId,
		Type: type,
		Tags: tags ? tags : null
	};
	const url = BACKEND_API_URL + `/types/priorities/${priorityId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deletePriority = async (sessionId: string, priorityId: string) => {
	const url = BACKEND_API_URL + `/types/priorities/${priorityId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
