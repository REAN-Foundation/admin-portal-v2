import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createPersonRoleType = async (
	sessionId: string,
	roleName: string,
	description: string
) => {
	const body = {
		RoleName: roleName,
		Description: description ? description : null
	};
	const url = BACKEND_API_URL + '/types/person-roles';
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [`session-${sessionId}:req-searchPersonRoleTypes`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getPersonRoleTypeById = async (sessionId: string, personRoleTypeId: string) => {
	const url = BACKEND_API_URL + `/types/person-roles/${personRoleTypeId}`;
	const cacheKey = `session-${sessionId}:req-getPersonRoleTypeById-${personRoleTypeId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchPersonRoleTypes = async (sessionId: string) => {
	const url = BACKEND_API_URL + `/types/person-roles`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const searchRoleTypes = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/roles/search${searchString}`;
	console.log('url', url);

	const cacheKey = `session-${sessionId}:req-searchRoleTypes:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updatePersonRoleType = async (
	sessionId: string,
	personRoleTypeId: string,
	roleName: string,
	description: string
) => {
	const body = {
		RoleName: roleName,
		Description: description ? description : ''
	};
	const url = BACKEND_API_URL + `/types/person-roles/${personRoleTypeId}`;
	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
	const keysToBeDeleted = [`session-${sessionId}:req-getPersonRoleTypeById-${personRoleTypeId}`];
	await DashboardManager.deleteMany(keysToBeDeleted);
	const findAndClearKeys = [`session-${sessionId}:req-searchRoleTypes`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deletePersonRoleType = async (sessionId: string, personRoleTypeId: string) => {
	const url = BACKEND_API_URL + `/types/person-roles/${personRoleTypeId}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getPersonRoleTypeById-${personRoleTypeId}`];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [`session-${sessionId}:req-searchRoleTypes`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};
