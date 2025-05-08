import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';

////////////////////////////////////////////////////////////////

export const createAudio = async (
	sessionId: string,
	name: string,
	transcript: string,
	pathUrl: string,
	tags: string[],
	version: string 
) => {
	const body = {
		Name: name,
		Transcript: transcript,
		Url: pathUrl,
		Tags: tags,
		Version: !version || version?.length === 0 ? 'V 1.0' : version,
	};

	const url = CAREPLAN_BACKEND_API_URL + '/assets/audio';
	return await post(sessionId, url, body, true);
};

export const getAudioById = async (sessionId: string, audioId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/audio/${audioId}`;
	return await get(sessionId, url, true);
};

export const searchAudio = async (sessionId: string, searchParams) => {
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
	const url = CAREPLAN_BACKEND_API_URL + `/assets/audio/search${searchString}`;
	return await get(sessionId, url, true);
};

export const updateAudio = async (
sessionId: string, audioId: string, name: string, transcript: string, pathUrl: string, PathUrl: string, tags: string[], version: string) => {
	const body = {
		Name: name,
		Transcript: transcript,
		Url: pathUrl,
		Tags: tags,
		Version: !version || version?.length === 0 ? 'V 1.0' : version,
	};

	const url = CAREPLAN_BACKEND_API_URL + `/assets/audio/${audioId}`;
	return await put(sessionId, url, body, true);
};

export const deleteAudio = async (sessionId: string, audioId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/audio/${audioId}`;
	return await del(sessionId, url, true);
};
