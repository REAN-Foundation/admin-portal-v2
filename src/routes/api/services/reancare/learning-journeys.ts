import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { del, get, post, put } from './common.reancare';


////////////////////////////////////////////////////////////////

export const createLearningJourney = async (
	sessionId: string,
	name: string,
	preferenceWeight: number,
	description: string,
	durationInDays: number,
	imageUrl: string,
	courseIds: string[],
) => {
	const body = {
		Name: name,
		PreferenceWeight: preferenceWeight ? preferenceWeight : null,
		Description: description ? description : null,
		DurationInDays: durationInDays ? durationInDays : null,
		ImageUrl: imageUrl ? imageUrl : null,
		CourseIds: courseIds,
	};
	const url = BACKEND_API_URL + '/educational/learning-paths';
	return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const getLearningJourneyById = async (sessionId: string, learningJourneyId: string) => {
	const url = BACKEND_API_URL + `/educational/learning-paths/${learningJourneyId}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const searchLearningJourneys = async (sessionId: string, searchParams?: any) => {
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
	const url = BACKEND_API_URL + `/educational/learning-paths/search${searchString}`;
	return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const updateLearningJourney = async (
	sessionId: string,
	learningJourneyId: string,
	name: string,
	preferenceWeight: number,
	description: string,
	durationInDays: number,
	imageUrl: string,
	courseIds: string[],
	
) => {
	const body = {
		Name: name,
		PreferenceWeight: preferenceWeight ? preferenceWeight : null,
		Description: description ? description : null,
		DurationInDays: durationInDays ? durationInDays : null,
		ImageUrl: imageUrl ? imageUrl : null,
		CourseIds: courseIds,
	};
	console.log(body);
	const url = BACKEND_API_URL + `/educational/learning-paths/${learningJourneyId}`;
	return await put(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};

export const deleteLearningJourney = async (sessionId: string, learningJourneyId: string) => {
	const url = BACKEND_API_URL + `/educational/learning-paths/${learningJourneyId}`;
	return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};
