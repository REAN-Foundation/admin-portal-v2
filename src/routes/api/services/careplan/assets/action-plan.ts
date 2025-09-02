import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { delete_, get_, post_, put_ } from '../../common';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { get } from '../common.careplan';

////////////////////////////////////////////////////////////////

export const createActionPlan = async (
	sessionId: string,
	name: string,
	description: string,
	tags: string[],
	version: string,
	tenantId: string
) => {
	const body = {
		Name: name,
		Description: description,
		Tags: tags,
		Version: !version || version.length === 0 ? 'V 1.0' : version,
		TenantId: tenantId,
	};

	const url = CAREPLAN_BACKEND_API_URL + '/assets/action-plans';
	const result = await post_(url, body, true, sessionId);

	// Clear asset search caches after creation
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};

export const getActionPlanById = async (sessionId: string, actionPlanId: string) => {
	const cacheKey = `session-${sessionId}:req-getActionPlanById-${actionPlanId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/action-plans/${actionPlanId}`;
	const result = await get_(url, true, sessionId);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchAssets = async (
	sessionId: string,
	selectAsset: string,
	searchParams: Record<string, string> = {}
) => {
	let searchString = '';
	const keys = Object.keys(searchParams);
	if (keys.length > 0) {
		const params = keys
			.filter((key) => searchParams[key])
			.map((key) => `${key}=${searchParams[key]}`);
		searchString = '?' + params.join('&');
	}

	const cacheKey = `session-${sessionId}:req-searchAssets:${selectAsset}:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/${selectAsset}/search${searchString}/`;
	const result = await get_(url, true, sessionId);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchActionplans = async (
	sessionId: string,
	searchParams: Record<string, string> = {}
) => {
	let searchString = '';
	const keys = Object.keys(searchParams);
	if (keys.length > 0) {
		const params = keys
			.filter((key) => searchParams[key])
			.map((key) => `${key}=${searchParams[key]}`);
		searchString = '?' + params.join('&');
	}

	const cacheKey = `session-${sessionId}:req-searchAssets:action-plans:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/action-plans/search${searchString}`;
	const result = await get(sessionId, url, true);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateActionPlan = async (
	sessionId: string,
	actionPlanId: string,
	name: string,
	description: string,
	tags: string[],
	version: string,
	tenantId: string
) => {
	const body = {
		Name: name,
		Description: description,
		Tags: tags,
		Version: !version || version.length === 0 ? 'V 1.0' : version,
		TenantId: tenantId,
	};

	const url = CAREPLAN_BACKEND_API_URL + `/assets/action-plans/${actionPlanId}`;
	const result = await put_(url, body, true, sessionId);

	// Clear cached get-by-id and search results
	await DashboardManager.deleteMany([`session-${sessionId}:req-getActionPlanById-${actionPlanId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};

export const deleteAsset = async (sessionId: string, selectAsset: string, assetId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/${selectAsset}/${assetId}`;
	const result = await delete_(url, true, sessionId);

	// Clear cache for that asset and search results
	await DashboardManager.deleteMany([`session-${sessionId}:req-getActionPlanById-${assetId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};
