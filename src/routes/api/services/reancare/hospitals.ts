import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createHospital = async (
	sessionId: string,
	name: string,
	healthSystemId: string,
	tags: string[]
) => {
	const body = {
		Name: name,
		HealthSystemId: healthSystemId ? healthSystemId : null,
		Tags: tags ? tags : []
	};
	const url = BACKEND_API_URL + '/hospitals';
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getHospitalById = async (sessionId: string, hospitalId: string) => {
	const url = BACKEND_API_URL + `/hospitals/${hospitalId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const searchHospitals = async (sessionId: string, searchParams?) => {
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
	const url = BACKEND_API_URL + `/hospitals/search${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updateHospital = async (
	sessionId: string,
	hospitalId: string,
	name: string,
	healthSystemId: string,
	tags: string[]
) => {
	const body = {
		hospitalId,
		Name: name,
		HealthSystemId: healthSystemId ? healthSystemId : null,
		Tags: tags ? tags : null
	};
	const url = BACKEND_API_URL + `/hospitals/${hospitalId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteHospital = async (sessionId: string, hospitalId: string) => {
	const url = BACKEND_API_URL + `/hospitals/${hospitalId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getHospitalsForHealthSystem = async (sessionId: string, healthSystemId: string) => {
    const url = BACKEND_API_URL + `/hospitals/health-systems/${healthSystemId}`;
    return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
