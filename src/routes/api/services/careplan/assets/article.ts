import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { delete_, get_, post_, put_ } from '../../common';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

////////////////////////////////////////////////////////////////

export const createArticle = async (
	sessionId: string,
	name: string,
	summary: string,
	pathUrl: string,
	tags: string[],
	version: string
) => {
	const body = {
		Name: name,
		Summary: summary,
		Url: pathUrl,
		Tags: tags,
		Version: !version || version.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + '/assets/articles';
	const result = await post_(url, body, true, sessionId);

	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);
	return result;
};

export const getArticleById = async (sessionId: string, articleId: string) => {
	const cacheKey = `session-${sessionId}:req-getArticleById-${articleId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/articles/${articleId}`;
	const result = await get_(url, true, sessionId);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchArticles = async (
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

	const cacheKey = `session-${sessionId}:req-searchAssets:articles:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/articles/search${searchString}`;
	const result = await get_(url, true, sessionId);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateArticle = async (
	sessionId: string,
	articleId: string,
	name: string,
	summary: string,
	pathUrl: string,
	tags: string[],
	version: string
) => {
	const body = {
		Name: name,
		Summary: summary,
		Url: pathUrl,
		Tags: tags,
		Version: !version || version.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + `/assets/articles/${articleId}`;
	const result = await put_(url, body, true, sessionId);

	await DashboardManager.deleteMany([`session-${sessionId}:req-getArticleById-${articleId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};

export const deleteArticle = async (sessionId: string, articleId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/articles/${articleId}`;
	const result = await delete_(url, true, sessionId);

	await DashboardManager.deleteMany([`session-${sessionId}:req-getArticleById-${articleId}`]);
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAssets`]);

	return result;
};
