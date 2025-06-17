import { API_CLIENT_INTERNAL_KEY, BOT_CONTENT_API_URL } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from '../reancare/common.reancare';

////////////////////////////////////////////////////////////////

export const createPromptsTemplate = async (
	sessionId: string,
	name: string,
	description: string,
	model: string,
	prompt: string,
	subgroup: string,
	type: string,
	variable: string[],
	temperature: number,
	topP: number,
	frequencyPenalty: number,
	presencePenalty: number,
	createdByUserId: string,
	isActive: boolean = true
) => {
	const body = {
		Name: name,
		Description: description ? description : null,
		Model: model ? model : null,
		Prompt: prompt ? prompt : null,
		Group: subgroup ? subgroup : null,
		UseCaseType: type ? type : null,
		Variables: variable ? variable : null,
		Temperature: temperature ? temperature : null,
		TopP: topP ? topP : null,
		FrequencyPenalty: frequencyPenalty ? frequencyPenalty : null,
		PresencePenalty: presencePenalty ? presencePenalty : null,
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
	model: string,
	prompt: string,
	subgroup: string,
	useCaseType: string,
	variables: string[],
	temperature: number,
	topP: number,
	frequencyPenalty: number,
	presencePenalty: number,
	createdByUserId: string,
	isActive: boolean = true
) => {
	const body = {
		Name: name ? name : null,
		Description: description ? description : null,
		Model: model ? model : null,
		Prompt: prompt ? prompt : null,
		Group: subgroup ? subgroup : null,
		UseCaseType: useCaseType ? useCaseType : null,
		Variables: variables ? variables : null,
		Temperature: temperature ? temperature : null,
		TopP: topP ? topP : null,
		FrequencyPenalty: frequencyPenalty ? frequencyPenalty : null,
		PresencePenalty: presencePenalty ? presencePenalty : null,
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
