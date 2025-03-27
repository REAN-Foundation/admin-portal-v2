import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
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
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getKnowledgeNuggetById = async (sessionId: string, knowledgeNuggetId: string) => {
	const url = BACKEND_API_URL + `/educational/knowledge-nuggets/${knowledgeNuggetId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
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
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
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
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteKnowledgeNugget = async (sessionId: string, knowledgeNuggetId: string) => {
	const url = BACKEND_API_URL + `/educational/knowledge-nuggets/${knowledgeNuggetId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
