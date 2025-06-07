import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { del, get, post, put } from '../common.careplan';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

////////////////////////////////////////////////////////////////

export const createMessage = async (
	sessionId: string,
	name: string,
	description: string,
	messageType: string,
	templateName: string,
	pathUrl: string,
	tags: string[],
	version: string,
	tenantId: string,
	templateVariables?: { [key: string]: any }
) => {
	const body = {
		Name              : name,
		Description       : description,
		MessageType       : messageType,
		TemplateName      : templateName,
		TemplateVariables : templateVariables || {},
		Url               : pathUrl,
		Tags              : tags,
		TenantId          : tenantId,
		Version           : !version || version?.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + '/assets/messages';
	const result = await post(sessionId, url, body, true);

	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);
	return result;
};

export const getMessageById = async (sessionId: string, messageId: string) => {
	const cacheKey = `session-${sessionId}:req-getMessageById-${messageId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/messages/${messageId}`;
	const result = await get(sessionId, url, true);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchMessages = async (sessionId: string, searchParams: Record<string, string> = {}) => {
	let searchString = '';
	const keys = Object.keys(searchParams);
	if (keys.length > 0) {
		const params = keys
			.filter((key) => searchParams[key])
			.map((key) => `${key}=${searchParams[key]}`);
		searchString = '?' + params.join('&');
	}

	const cacheKey = `session-${sessionId}:req-searchAssets:message:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/messages/search${searchString}`;
	const result = await get(sessionId, url, true);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateMessage = async (
	sessionId: string,
	messageId: string,
	name: string,
	description: string,
	messageType: string,
	templateName: string,
	pathUrl: string,
	tags: string[],
	version: string,
	tenantId: string,
	templateVariables?: { [key: string]: any }
) => {
	const body = {
		Name              : name,
		Description       : description,
		MessageType       : messageType,
		TemplateName      : templateName,
		TemplateVariables : templateVariables || {},
		Url               : pathUrl,
		Tags              : tags,
		TenantId          : tenantId,
		Version           : !version || version?.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + `/assets/messages/${messageId}`;
	const result = await put(sessionId, url, body, true);

	await DashboardManager.deleteMany([`session-${sessionId}:req-getMessageById-${messageId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};

export const deleteMessage = async (sessionId: string, messageId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/messages/${messageId}`;
	const result = await del(sessionId, url, true);

	await DashboardManager.deleteMany([`session-${sessionId}:req-getMessageById-${messageId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};
