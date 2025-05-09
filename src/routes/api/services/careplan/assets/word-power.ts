import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { delete_, get_, post_, put_ } from '../../common';

////////////////////////////////////////////////////////////////

export const createWordPower = async (
	sessionId: string,
	name: string,
	description: string,
	additionalResources: string[],
	tags: string[],
	version: string
) => {
	const body = {
		Name: name,
		Description: description,
		AdditionalResources: additionalResources,
		Tags: tags,
		Version: !version || version?.length === 0 ? 'V 1.0' : version
	};
	const url = CAREPLAN_BACKEND_API_URL + '/assets/word-power';
	return await post_(url, body, true, sessionId);
};

export const getWordPowerById = async (sessionId: string, wordPowerId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/word-power/${wordPowerId}`;
	return await get_(url, true, sessionId);
};

export const searchWordPower = async (sessionId: string, searchParams) => {
	let searchString = '';
	const keys = Object.keys(searchParams);
	if (keys.length > 0) {
		searchString = '?';
		for (const key of keys) {
			searchString += `${key}=${searchParams[key]}`;
		}
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/word-power/search${searchString}`;
	return await get_(url, true, sessionId);
};

export const updateWordPower = async (
	sessionId: string,
	wordPowerId: string,
	name: string,
	description: string,
	additionalResources: string[],
	tags: string[],
	version: string
) => {
	const body = {
		Name: name,
		Description: description,
		Tags: tags,
		AdditionalResources: additionalResources,
		Version: !version || version?.length === 0 ? 'V 1.0' : version
	};
	const url = CAREPLAN_BACKEND_API_URL + `/assets/word-power/${wordPowerId}`;
	return await put_(url, body, true, sessionId);
};

export const deleteWordPower = async (sessionId: string, wordPowerId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/word-power/${wordPowerId}`;
	return await delete_(url, true, sessionId);
};
