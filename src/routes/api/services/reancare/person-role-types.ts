import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
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
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getPersonRoleTypeById = async (sessionId: string, personRoleTypeId: string) => {
	const url = BACKEND_API_URL + `/types/person-roles/${personRoleTypeId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
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
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updatePersonRoleType = async (
	sessionId: string,
	personRoleTypeId: string,
	roleName: string,
	description: string
) => {
	const body = {
		RoleName: roleName,
		Description: description ? description : null
	};
	const url = BACKEND_API_URL + `/types/person-roles/${personRoleTypeId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deletePersonRoleType = async (sessionId: string, personRoleTypeId: string) => {
	const url = BACKEND_API_URL + `/types/person-roles/${personRoleTypeId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
