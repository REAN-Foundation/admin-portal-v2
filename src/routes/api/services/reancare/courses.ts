import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createCourse = async (
	sessionId: string,
	name: string,
	description: string,
	durationInDays: number,
	imageUrl: string,
) => {
	const body = {
		Name: name,
		Description: description ? description : null,
		DurationInDays: durationInDays ? durationInDays : null,
		ImageUrl: imageUrl ? imageUrl : null,
	};
	const url = BACKEND_API_URL + '/educational/courses';
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getCourseById = async (sessionId: string, courseId: string) => {
	const url = BACKEND_API_URL + `/educational/courses/${courseId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const searchCourses = async (sessionId: string, searchParams?) => {
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
	const url = BACKEND_API_URL + `/educational/courses/search${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updateCourse = async (
	sessionId: string,
	courseId: string,
	name: string,
	description: string,
	durationInDays: number,
	imageUrl: string,
) => {
	const body = {
		courseId,
		Name: name,
		Description: description ? description : null,
		DurationInDays: durationInDays ? durationInDays : null,
		ImageUrl: imageUrl ? imageUrl : null,
	};
	const url = BACKEND_API_URL + `/educational/courses/${courseId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteCourse = async (sessionId: string, courseId: string) => {
	const url = BACKEND_API_URL + `/educational/courses/${courseId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
