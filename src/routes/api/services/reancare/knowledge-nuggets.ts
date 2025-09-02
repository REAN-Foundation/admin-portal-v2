import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createKnowledgeNugget = async (
	sessionId: string,
	topicName: string,
	briefInformation: string,
	detailedInformation: string,
	additionalResources: string[],
	tags: string[]
) => {
	const body = {
		TopicName: topicName,
		BriefInformation: briefInformation ? briefInformation : null,
		DetailedInformation: detailedInformation ? detailedInformation : null,
		AdditionalResources: additionalResources ? additionalResources : null,
		Tags: tags ? tags : null
	};
	const url = BACKEND_API_URL + '/educational/knowledge-nuggets';
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
		
			const findAndClearKeys = [
				`session-${sessionId}:req-searchKnowledgeNuggets`
			];
			await DashboardManager.findAndClear(findAndClearKeys);
		
			return result;
};

export const getKnowledgeNuggetById = async (sessionId: string, knowledgeNuggetId: string) => {
	const url = BACKEND_API_URL + `/educational/knowledge-nuggets/${knowledgeNuggetId}`;
		const cacheKey = `session-${sessionId}:req-getKnowledgeNuggetById-${knowledgeNuggetId}`;
		if (await DashboardManager.has(cacheKey)) {
			return await DashboardManager.get(cacheKey);
		}
		const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
		await DashboardManager.set(cacheKey, result);
		return result;
};

export const searchKnowledgeNuggets = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/educational/knowledge-nuggets/search${searchString}`;
	 const cacheKey = `session-${sessionId}:req-searchKnowledgeNuggets:${searchString}`;
		if (await DashboardManager.has(cacheKey)) {
			return await DashboardManager.get(cacheKey);
		}
	
		const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
		await DashboardManager.set(cacheKey, result);
		return result;
};

export const updateKnowledgeNugget = async (
	sessionId: string,
	knowledgeNuggetId: string,
	topicName: string,
	briefInformation: string,
	detailedInformation: string,
	additionalResources: string[],
	tags: string[]
) => {
	const body = {
		TopicName: topicName,
		BriefInformation: briefInformation ? briefInformation : '',
		DetailedInformation: detailedInformation ? detailedInformation : '',
		AdditionalResources: additionalResources ? additionalResources : null,
		Tags: tags ? tags : null
	};
	const url = BACKEND_API_URL + `/educational/knowledge-nuggets/${knowledgeNuggetId}`;
		const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
		const keysToBeDeleted = [
			`session-${sessionId}:req-getKnowledgeNuggetById-${knowledgeNuggetId}`,
		];
		await DashboardManager.deleteMany(keysToBeDeleted);
		const findAndClearKeys = [
			`session-${sessionId}:req-searchKnowledgeNuggets`,
		];
		await DashboardManager.findAndClear(findAndClearKeys);
	
		return result;
};

export const deleteKnowledgeNugget = async (sessionId: string, knowledgeNuggetId: string) => {
	const url = BACKEND_API_URL + `/educational/knowledge-nuggets/${knowledgeNuggetId}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
		
			const keysToBeDeleted = [
				`session-${sessionId}:req-getKnowledgeNuggetById-${knowledgeNuggetId}`,
			];
			await DashboardManager.deleteMany(keysToBeDeleted);
		
			const findAndClearKeys = [
				`session-${sessionId}:req-searchKnowledgeNuggets`,
			];
			await DashboardManager.findAndClear(findAndClearKeys);
		
			return result;
};
