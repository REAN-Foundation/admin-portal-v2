import { delete_, get_, post_, put_ } from '../common';

export const get = async (
	sessionId: string,
	url: string,
	authorizeUser = false,
) => {
	return await get_(url, authorizeUser, sessionId);
};

export const post = async (
	sessionId: string,
	url: string,
	bodyObj: unknown,
	authorizeUser = false,
    xApiKey?: string
) => {
	return await post_(sessionId, url, bodyObj, authorizeUser, xApiKey);
};

export const put = async (
	sessionId: string,
	url: string,
	bodyObj: unknown,
	authorizeUser = false,
    xApiKey?: string
) => {
	return await put_(sessionId, url, bodyObj, authorizeUser, xApiKey);
};

export const del = async (
	sessionId: string,
	url: string,
	authorizeUser = false,
    xApiKey?: string
) => {
	return await delete_(sessionId, url, authorizeUser, xApiKey);
};
