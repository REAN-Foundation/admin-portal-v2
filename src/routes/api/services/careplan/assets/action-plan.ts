import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { delete_, get_, post_, put_ } from '../../common';
import { del, get, post, put } from '../common.careplan';

////////////////////////////////////////////////////////////////

export const createActionPlan = async (
	sessionId: string,
	name: string,
	description: string,
	tags: string[],
	version: string
) => {
	const body = {
		Name: name,
		Description: description,
		Tags: tags,
		Version: !version || version?.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + '/assets/action-plans';
	return await post(sessionId,url, body, true);
};

export const getActionPlanById = async (sessionId: string, actionPlanId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/action-plans/${actionPlanId}`;
	return await get(sessionId,url, true);
};

export const searchAssets = async (sessionId: string, selectAsset: string, searchParams = {}) => {
	let searchString = '';
	const keys = Object.keys(searchParams);
	if (keys.length > 0) {
		searchString = '?' + keys.map(key => `${key}=${encodeURIComponent(searchParams[key])}`).join('&');
	}
	const url = `${CAREPLAN_BACKEND_API_URL}/assets/${selectAsset}/search${searchString}`;
	return await get(sessionId,url, true);
};


// export const searchAssets = async (sessionId: string, selectAsset: string, searchParams = '') => {
// 	let searchString = '';
// 	const keys = Object.keys(searchParams);
// 	if (keys.length > 0) {
// 		searchString = '?';
// 		for (const key of keys) {
// 			searchString += `${key}=${searchParams[key]}`;
// 		}
// 	}
// 	const url = CAREPLAN_BACKEND_API_URL + `/assets/${selectAsset}/search${searchString}/`;
// 	return await get_(url, true, sessionId);
// };

export const updateActionPlan = async (
	sessionId: string,
	actionPlanId: string,
	name: string,
	description: string,
	tags: string[],
	version: string
) => {
	const body = {
		Name: name,
		Description: description,
		Tags: tags,
		Version: !version || version?.length === 0 ? 'V 1.0' : version
	};
	const url = CAREPLAN_BACKEND_API_URL + `/assets/action-plans/${actionPlanId}`;
	return await put(sessionId, url, body, true);
};

export const deleteAsset = async (sessionId: string, selectAsset: string, assetId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/${selectAsset}/${assetId}`;
	console.log('url', url);
	return await del(sessionId, url, true);
};
