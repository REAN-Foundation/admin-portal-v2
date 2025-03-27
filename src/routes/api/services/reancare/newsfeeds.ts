import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createNewsfeed = async (
	sessionId: string,
	title: string,
	description: string,
	category: string,
	link: string,
	language: string,
	copyright: string,
	favicon: string,
	image: string,
	tags: string[]
) => {
	const body = {
		Title: title,
		Description: description ? description : null,
		Category: category ? category : null,
		Link: link ? link : null,
		Language: language,
		Copyright: copyright ? copyright : null,
		Favicon: favicon ? favicon : null,
		Image: image ? image : null,
		Tags: tags
	};
	const url = BACKEND_API_URL + '/rss-feeds';
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getNewsfeedById = async (sessionId: string, newsfeedId: string) => {
	const url = BACKEND_API_URL + `/rss-feeds/${newsfeedId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const searchNewsfeeds = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/rss-feeds/search${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updateNewsfeed = async (
	sessionId: string,
	newsfeedId: string,
	title: string,
	description: string,
	category: string,
	link: string,
	language: string,
	copyright: string,
	favicon: string,
	image: string,
	tags: string[]
) => {
	const body = {
		Title: title,
		Description: description ? description : null,
		Category: category ? category : null,
		Link: link ? link : null,
		Language: language,
		Copyright: copyright ? copyright : null,
		Favicon: favicon ? favicon : null,
		Image: image ? image : null,
		Tags: tags
	};
	const url = BACKEND_API_URL + `/rss-feeds/${newsfeedId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteNewsfeed = async (sessionId: string, newsfeedId: string) => {
	const url = BACKEND_API_URL + `/rss-feeds/${newsfeedId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
