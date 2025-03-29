import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { del, get, post, put } from './common.reancare';

////////////////////////////////////////////////////////////////

export const createModule = async (
	sessionId: string,
	courseId: string,
	name: string,
	description: string,
	durationInMins: number,
	imageUrl: string,
	sequence: number
) => {
	const body = {
		CourseId: courseId,
		Name: name,
		Description: description ? description : null,
		DurationInMins: durationInMins ? durationInMins : null,
		ImageUrl: imageUrl ? imageUrl : null,
		Sequence: sequence ? sequence : null
	};
	const url = BACKEND_API_URL + '/educational/course-modules';
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getModuleById = async (sessionId: string, moduleId: string) => {
	const url = BACKEND_API_URL + `/educational/course-modules/${moduleId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const searchModules = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/educational/course-modules/search${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updateModule = async (
	sessionId: string,
	moduleId: string,
	courseId: string,
	name: string,
	description: string,
	durationInMins: number,
	imageUrl: string,
	sequence: number
) => {
	const body = {
		CourseId: courseId,
		Name: name,
		Description: description ? description : null,
		DurationInMins: durationInMins,
		ImageUrl: imageUrl ? imageUrl : null,
		Sequence: sequence ? sequence : null
	};

	console.log("body",body)
	const url = BACKEND_API_URL + `/educational/course-modules/${moduleId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteModule = async (sessionId: string, moduleId: string) => {
	const url = BACKEND_API_URL + `/educational/course-modules/${moduleId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
