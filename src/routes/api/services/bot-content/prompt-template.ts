import { API_CLIENT_INTERNAL_KEY, BOT_CONTENT_API_URL } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { delete_, get_, post_, put_ } from '../common';
import { del, get, post, put } from '../reancare/common.reancare';

////////////////////////////////////////////////////////////////

export const createPromptsTemplate = async (
	sessionId: string,
	name: string,
	description: string,
	content: string,
	category: string,
	subgroup: string,
	type: string,
	variable: string[],
	version: number,
	createdByUserId: string,
	isActive: boolean = true
) => {
	const body = {
		Name: name,
		Description: description ? description : null,
		Content: content ? content : null,
		Category: category ? category : null,
		SubGroup: subgroup ? subgroup : null,
		Type: type ? type : null,
		Variables: variable ? variable : null,
		Version: version ? version : null,
		CreatedByUserId: createdByUserId ? createdByUserId : null,
		IsActive: isActive
	};
	console.log();

	const url = BOT_CONTENT_API_URL + '/llm-prompt-templates';
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [`session-${sessionId}:req-searchPromptTemplate`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getPromptTemplateById = async (sessionId: string, promptId: string) => {
	const url = BOT_CONTENT_API_URL + `/llm-prompt-templates/${promptId}`;
	const cacheKey = `session-${sessionId}:req-getPromptTemplateById-${promptId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}
	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchPromptTemplate = async (sessionId: string, searchParams?: any) => {
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
	const url = BOT_CONTENT_API_URL + `/llm-prompt-templates/search${searchString}`;
	console.log('url', url);
	const cacheKey = `session-${sessionId}:req-searchPromptTemplate:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updatePromptTemplate = async (
	sessionId: string,
	promptId: string,
	name: string,
	description: string,
	content: string,
	subgroup: string,
	type: string,
	category: string,
	variables: string[],
	createdByUserId: string,
	isActive: boolean = true
) => {
	const body = {
		Name: name ? name : null,
		Description: description ? description : null,
		Content: content ? content : null,
		SubGroup: subgroup ? subgroup : null,
		Type: type ? type : null,
		Category: category ? category : null,
		Variables: variables ? variables : null,
		CreatedByUserId: createdByUserId ? createdByUserId : null,
		IsActive: isActive
	};
	const url = BOT_CONTENT_API_URL + `/llm-prompt-templates/${promptId}`;
	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
	const keysToBeDeleted = [`session-${sessionId}:req-getPromptTemplateById-${promptId}`];
	await DashboardManager.deleteMany(keysToBeDeleted);
	const findAndClearKeys = [`session-${sessionId}:req-searchPromptTemplate`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deletePromptTemplate = async (sessionId: string, promptId: string) => {
	const url = BOT_CONTENT_API_URL + `/llm-prompt-templates/${promptId}`;
	console.log(url);
	
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getPromptTemplateById-${promptId}`];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [`session-${sessionId}:req-searchPromptTemplate`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};
