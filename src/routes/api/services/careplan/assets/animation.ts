import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { delete_, get_, post_, put_ } from '../../common';
////////////////////////////////////////////////////////////////

export const createAnimation = async (
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
		Version: !version || version?.length === 0 ? 'V 1.0' : version
	};
	const url = CAREPLAN_BACKEND_API_URL + '/assets/animations';
	return await post_(url, body, true, sessionId);
};

export const getAnimationById = async (sessionId: string, animationId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/animations/${animationId}`;
	return await get_(url, true, sessionId);
};

export const searchAnimation = async (sessionId: string, searchParams) => {
	let searchString = '';
	const keys = Object.keys(searchParams);
	if (keys.length > 0) {
		searchString = '?';
		for (const key of keys) {
			searchString += `${key}=${searchParams[key]}`;
		}
	}
	const url = CAREPLAN_BACKEND_API_URL + `/assets/animations/search${searchString}`;
	return await get_(url, true, sessionId);
};

export const updateAnimation = async (
	sessionId: string,
	animationId: string,
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
		Version: !version || version?.length === 0 ? 'V 1.0' : version
	};
	const url = CAREPLAN_BACKEND_API_URL + `/assets/animations/${animationId}`;
	return await put_(url, body, true, sessionId);
};

export const deleteAnimation = async (sessionId: string, animationId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/animations/${animationId}`;
	return await delete_(url, true, sessionId);
};
