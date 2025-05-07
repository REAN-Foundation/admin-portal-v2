import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { delete_, get_, post_, put_ } from '../../common';

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
	return await post_(url, body, true, sessionId);
};

export const getActionPlanById = async (sessionId: string, actionPlanId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/action-plans/${actionPlanId}`;
	return await get_(url, true, sessionId);
};

export const searchAssets = async (sessionId: string, selectAsset: string, searchParams = '') => {
	let searchString = '';
	const keys = Object.keys(searchParams);
	if (keys.length > 0) {
		searchString = '?';
		for (const key of keys) {
			searchString += `${key}=${searchParams[key]}`;
		}
	}
	const url = CAREPLAN_BACKEND_API_URL + `/assets/${selectAsset}/search${searchString}/`;
	return await get_(url, true, sessionId);
};

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
	return await put_(url, body, true, sessionId);
};

export const deleteAsset = async (sessionId: string, selectAsset: string, assetId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/${selectAsset}/${assetId}`;
	console.log('url', url);
	return await delete_(url, true, sessionId);
};
