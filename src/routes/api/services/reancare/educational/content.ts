import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { del, get, post, put } from '../common.reancare';

///////////////////////////////////////////////////////////////////////////////

export const createContent = async (
	sessionId: string,
	title: string,
	contentType: string,
	moduleId: string,
	description?: string,
	sequence?: number,
	resourceLink?: string,
	imageUrl?: string,
	durationInMins?: number
) => {
	const body: any = {
		ModuleId: moduleId,
		Title: title,
		ContentType: contentType
	};
	
	if (description !== undefined && description !== null) {
		body.Description = description;
	}
	if (sequence !== undefined && sequence !== null) {
		body.Sequence = sequence;
	}
	if (resourceLink !== undefined && resourceLink !== null) {
		body.ResourceLink = resourceLink;
	}
	if (imageUrl !== undefined && imageUrl !== null) {
		body.ImageUrl = imageUrl;
	}
	if (durationInMins !== undefined && durationInMins !== null) {
		body.DurationInMins = durationInMins;
	}
	const url = BACKEND_API_URL + '/educational/course-contents';
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const findAndClearKeys = [`session-${sessionId}:req-searchContents`];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const getContentById = async (sessionId: string, id: string) => {
	const url = BACKEND_API_URL + `/educational/course-contents/${id}`;

	const cacheKey = `session-${sessionId}:req-getContentById-${id}`;

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchContents = async (sessionId: string, searchParams?) => {
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
	const url = BACKEND_API_URL + `/educational/course-contents/search${searchString}`;

	const cacheKey = `session-${sessionId}:req-searchContents:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
	await DashboardManager.set(cacheKey, result);
	return result;
};

export const updateContent = async (
	sessionId: string,
	contentId: string,
	title: string,
	contentType: string,
	description?: string,
	sequence?: number,
	resourceLink?: string,
	imageUrl?: string,
	durationInMins?: number
) => {
	const body: any = {
		contentId,
		Title: title,
		ContentType: contentType
	};
	
	if (description !== undefined && description !== null) {
		body.Description = description;
	}
	if (sequence !== undefined && sequence !== null) {
		body.Sequence = sequence;
	}
	if (resourceLink !== undefined && resourceLink !== null) {
		body.ResourceLink = resourceLink;
	}
	if (imageUrl !== undefined && imageUrl !== null) {
		body.ImageUrl = imageUrl;
	}
	if (durationInMins !== undefined && durationInMins !== null) {
		body.DurationInMins = durationInMins;
	}
	const url = BACKEND_API_URL + `/educational/course-contents/${contentId}`;
	const result = await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getContentById-${contentId}`,];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [`session-${sessionId}:req-searchContents`,];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

export const deleteContent = async (sessionId: string, id: string) => {
	const url = BACKEND_API_URL + `/educational/course-contents/${id}`;
	const result = await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	const keysToBeDeleted = [`session-${sessionId}:req-getContentById-${id}`,];
	await DashboardManager.deleteMany(keysToBeDeleted);

	const findAndClearKeys = [
		`session-${sessionId}:req-searchContents`
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

