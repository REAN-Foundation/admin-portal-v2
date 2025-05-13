import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { delete_, get_, post_, put_ } from '../../common';

////////////////////////////////////////////////////////////////

export const createVideo = async (
	sessionId: string,
	name: string,
	transcript: string,
	pathUrl: string,
	userId: string,
	tags: string[],
	version: string
) => {
	const body = {
		Name: name,
		Transcript: transcript,
		Url: pathUrl,
		OwnerUserId: userId,
		Tags: tags,
		Version: !version || version?.length === 0 ? 'V 1.0' : version
	};
	const url = CAREPLAN_BACKEND_API_URL + '/assets/video';
	return await post_(url, body, true, sessionId);
};

export const getVideoById = async (sessionId: string, videoId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/video/${videoId}`;
	return await get_(url, true, sessionId);
};

export const searchVideos = async (sessionId: string, searchParams: any) => {
	let searchString = '';
	const keys = Object.keys(searchParams);
	if (keys.length > 0) {
		searchString = '?';

		for (const key of keys) {
			searchString += `${key}=${searchParams[key]}`;
		}
	}
	const url = CAREPLAN_BACKEND_API_URL + `/assets/web-newsfeeds/search${searchString}`;
	return await get_(url, true, sessionId);
};

export const updateVideo = async (
	sessionId: string,
	videoId: string,
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
	const url = CAREPLAN_BACKEND_API_URL + `/assets/video/${videoId}`;
	return await put_(url, body, true, sessionId);
};

export const deleteVideo = async (sessionId: string, videoId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/video/${videoId}`;
	return await delete_(url, true, sessionId);
};
