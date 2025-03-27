import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createCohort = async (
	sessionId: string,
    tenantId: string,
	name: string,
	description: string,
	imageUrl: string,
) => {
	const body = {
    TenantId: tenantId,
		Name: name,
		Description: description ? description : null,
		ImageUrl: imageUrl ? imageUrl : null,
	};
	const url = BACKEND_API_URL + '/cohorts';
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getCohortById = async (sessionId: string, cohortId: string) => {
	const url = BACKEND_API_URL + `/cohorts/${cohortId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const searchCohorts = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/cohorts/search${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updateCohort = async (
	sessionId: string,
	cohortId: string,
  tenantId: string,
	name: string,
	description: string,
	imageUrl: string,
) => {
	const body = {
    TenantId: tenantId,
		Name: name,
		Description: description ? description : null,
		ImageUrl: imageUrl ? imageUrl : null,
	};
	const url = BACKEND_API_URL + `/cohorts/${cohortId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteCohort = async (sessionId: string, cohortId: string) => {
	const url = BACKEND_API_URL + `/cohorts/${cohortId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
