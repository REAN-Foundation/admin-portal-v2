import { delete_, get_, post_, put_ } from '../common';

export const get = async (
	sessionId: string,
	url: string,
	authorizeUser = false,
   
) => {
	return await get_(url, true, sessionId);
};

export const post = async (
	sessionId: string,
	url: string,
	bodyObj: unknown,
	authorizeUser = false,
   
) => {
	return await post_(url, bodyObj, true, sessionId);
};

export const put = async (
	sessionId: string,
	url: string,
	bodyObj: unknown,
	authorizeUser = false,
   
) => {
	return await put_(url, bodyObj, true, sessionId);
};

export const del = async (
	sessionId: string,
	url: string,
	authorizeUser = false,
   
) => {
	return await delete_(url, true, sessionId);
};
