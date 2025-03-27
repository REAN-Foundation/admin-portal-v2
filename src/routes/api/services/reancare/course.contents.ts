import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createCourseContent = async (
	sessionId: string,
	moduleId: string,
	title: string,
	description: string,
	durationInMins: number,
	sequence: number,
	contentType: string,
	resourceLink: string,
	imageUrl: string
) => {
	const body = {
		ModuleId: moduleId,
		Title: title,
		Description: description ? description : null,
		DurationInMins: durationInMins ? durationInMins : null,
		Sequence: sequence ? sequence : null,
		ImageUrl: imageUrl ? imageUrl : null,
		ContentType: contentType ? contentType : null,
		ResourceLink: resourceLink
	};
	const url = BACKEND_API_URL + '/educational/course-contents';
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getCourseContentById = async (sessionId: string, contentId: string) => {
	const url = BACKEND_API_URL + `/educational/course-contents/${contentId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const searchCourseContents = async (sessionId: string, searchParams?: any) => {
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
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updateCourseContent = async (
	sessionId: string,
	moduleId: string,
	contentId: string,
	title: string,
	description: string,
	durationInMins: number,
	sequence: number,
	contentType: string,
	resourceLink: string,
	imageUrl: string
) => {
	const body = {
		ModuleId: moduleId,
		Title: title,
		Description: description ? description : null,
		DurationInMins: durationInMins ? durationInMins : null,
		Sequence: sequence ? sequence : null,
		ImageUrl: imageUrl ? imageUrl : null,
		ContentType: contentType ? contentType : null,
		ResourceLink: resourceLink
	};
	const url = BACKEND_API_URL + `/educational/course-contents/${contentId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteCourseContent = async (sessionId: string, contentId: string) => {
	const url = BACKEND_API_URL + `/educational/course-contents/${contentId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
