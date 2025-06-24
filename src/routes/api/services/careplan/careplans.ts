import {
	API_CLIENT_INTERNAL_KEY,
	CAREPLAN_BACKEND_API_URL,
	CAREPLAN_SERVICE_API_KEY
} from '$env/static/private';
import FormData from 'form-data';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from './common.careplan';
import { ServerHelper } from '$lib/server/server.helper';
import { SessionManager } from '$routes/api/cache/session/session.manager';
import axios from 'axios';
import fs from 'fs';

// ////////////////////////////////////////////////////////////////

export const createCareplan = async (
	sessionId: string,
	code: string,
	categoryId: string,
	name: string,
	description: string,
	tags: string[],
	version: string,
	ownerUserId: string,
	tenantId: string
) => {
	const url = CAREPLAN_BACKEND_API_URL + '/careplans';
	const body = {
		Code: code,
		CategoryId: categoryId,
		Name: name,
		OwnerUserId: ownerUserId,
		TenantId: tenantId,
		Description: description ? description : null,
		Tags: tags,
		Version: !version || version?.length === 0 ? 'V 1.0' : version
	};

	const result = await post(sessionId, url, body, true);

	const findAndClearKeys = [`session-${sessionId}:req-searchCareplan`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const searchCareplan = async (sessionId: string, searchParams?) => {
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

	const url = CAREPLAN_BACKEND_API_URL + `/careplans/search${searchString}`;
	// const cacheKey = `session-${sessionId}:req-searchCareplan:${searchString}`;
	// if (await DashboardManager.has(cacheKey)) {
	// 	return await DashboardManager.get(cacheKey);
	// }

	const result = await get(sessionId, url, true);
	// await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchCareplanActivity = async (sessionId: string, searchParams?) => {
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

	const url = CAREPLAN_BACKEND_API_URL + `/careplan-activities/search${searchString}`;
	const cacheKey = `session-${sessionId}:req-CareplanActivities:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const deleteCareplan = async (sessionId: string, careplanId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/careplans/${careplanId}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getCarePlanById-${careplanId}`];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [`session-${sessionId}:req-searchCareplan`];
	await DashboardManager.findAndClear(findAndClearKeys);
	return result;
};

export const getCarePlanById = async (sessionId: string, careplanId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/careplans/${careplanId}`;
	const cacheKey = `session-${sessionId}:req-getCarePlanById-${careplanId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}
	const result = await get(sessionId, url, true);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateCarePlan = async (
	sessionId: string,
	careplanId: string,
	code: string,
	name: string,
	categoryId: string,
	Description: string,
	tags: string[],
	version: string,
    ownerUserId: string,
	tenantId: string,
	
) => {
	const body = {
		Code: code,
		Description: Description ? Description : null,
		Name: name,
		CategoryId: categoryId,
		Tags: tags ? tags : null,
		OwnerUserId: ownerUserId,
		TenantId: tenantId,
		Version: !version || version?.length === 0 ? 'V 1.0' : version
	};
	const url = CAREPLAN_BACKEND_API_URL + `/careplans/${careplanId}`;
	const result = await put(sessionId, url, body, true);

	const keysToBeDeleted = [`session-${sessionId}:req-getCarePlanById-${careplanId}`];
	await DashboardManager.deleteMany(keysToBeDeleted);
	const findAndClearKeys = [`session-${sessionId}:req-searchCareplan`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const searchCareplanCategories = async (sessionId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/careplan-categories/search`;
	const result = await get(sessionId, url, true);
	return result;
};

export const importCareplan = async (
	sessionId: string,
	fileName: string,
	filePath: string,
	isPublic?: true
) => {
	const url = CAREPLAN_BACKEND_API_URL + '/careplans/import-file';
	const session = await SessionManager.getSession(sessionId);
	const accessToken = session.accessToken;
	const mimeType = ServerHelper.getMimeTypeFromFileName(fileName);
	console.log(`Importing care plan from file: ${fileName}, MIME type: ${mimeType}`);
	const form = new FormData();

	form.append('file', fs.createReadStream(filePath));
	form.append('IsPublicResource', isPublic ? 'true' : 'false');

	const headers = {
		'Content-Type': 'multipart/form-data',
		'x-api-key': CAREPLAN_SERVICE_API_KEY,
		Authorization: `Bearer ${accessToken}`
	};

	try {
		const res = await axios.post(url, form, { headers });

		const response = res.data;
		return response;
	} catch (error) {

		return error.response.data;
	}
};

export const exportCareplanById = async (sessionId: string, careplanId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/careplans/${careplanId}/export`;
	const session = await SessionManager.getSession(sessionId);
	const accessToken = session.accessToken;
	const headers = {};
	headers['Content-Type'] = 'application/json';
	headers['x-api-key'] = CAREPLAN_SERVICE_API_KEY;
	headers['Authorization'] = `Bearer ${accessToken}`;
	const res = await fetch(url, {
		method: 'GET',
		headers
	});
	if (!res.ok) {
		throw new Error(`Failed to export care plan: ${res.statusText}`);
	}
	const blob = await res.blob();
	return blob;
};
