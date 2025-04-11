import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createLabRecordType = async (
	sessionId: string,
	typeName: string,
	displayName: string,
	snowmedCode: string,
	loincCode: string,
	normalRangeMin: number,
	normalRangeMax: number,
	unit: string
) => {
	const body = {
		TypeName: typeName,
		DisplayName: displayName ? displayName : null,
		SnowmedCode: snowmedCode ? snowmedCode : null,
		LoincCode: loincCode ? loincCode : null,
		NormalRangeMin: normalRangeMin ? normalRangeMin : 0.0,
		NormalRangeMax: normalRangeMax ? normalRangeMax : 0.0,
		Unit: unit ? unit : null
	};
	const url = BACKEND_API_URL + '/types/lab-records';
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getLabRecordTypeById = async (sessionId: string, labRecordTypeId: string) => {
	const url = BACKEND_API_URL + `/types/lab-records/${labRecordTypeId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const searchLabRecordTypes = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/types/lab-records/search${searchString}`;
	console.log(url);
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updateLabRecordType = async (
	sessionId: string,
	labRecordTypeId: string,
	typeName: string,
	displayName: string,
	snowmedCode: string,
	loincCode: string,
	normalRangeMin: number,
	normalRangeMax: number,
	unit: string
) => {
	const body = {
		TypeName: typeName,
		DisplayName: displayName ? displayName : null,
		SnowmedCode: snowmedCode ? snowmedCode : '',
		LoincCode: loincCode ? loincCode : '',
		NormalRangeMin: normalRangeMin ? normalRangeMin : 0.0,
		NormalRangeMax: normalRangeMax ? normalRangeMax : 0.0,
		Unit: unit ? unit : ''
	};
	const url = BACKEND_API_URL + `/types/lab-records/${labRecordTypeId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteLabRecordType = async (sessionId: string, labRecordTypeId: string) => {
	const url = BACKEND_API_URL + `/types/lab-records/${labRecordTypeId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
