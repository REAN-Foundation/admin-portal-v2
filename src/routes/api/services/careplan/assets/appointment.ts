import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { delete_, get_, post_, put_ } from '../../common';

////////////////////////////////////////////////////////////////

export const createAppointment = async (
	sessionId: string,
	name: string,
	description: string,
	appointmentType: string,
	tags: string[],
	version: string
) => {
	const body = {
		Name: name,
		Description: description,
		AppointmentType: appointmentType,
		Tags: tags,
		Version: !version || version?.length === 0 ? 'V 1.0' : version
	};
	const url = CAREPLAN_BACKEND_API_URL + '/assets/appointments';
	console.log('url--------', url);
	return await post_(url, body, true, sessionId);
};

export const getAppointmentById = async (sessionId: string, appointmentId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/appointments/${appointmentId}`;
	return await get_(url, true, sessionId);
};

export const searchAppointments = async (sessionId: string, searchParams) => {
	let searchString = '';
	const keys = Object.keys(searchParams);
	if (keys.length > 0) {
		searchString = '?';
		for (const key of keys) {
			searchString += `${key}=${searchParams[key]}`;
		}
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/appointments/search${searchString}`;
	return await get_(url, true, sessionId);
};

export const updateAppointment = async (
	sessionId: string,
	appointmentId: string,
	name: string,
	description: string,
	appointmentType: string,
	tags: string[],
	version: string
) => {
	const body = {
		Name: name,
		Description: description,
		AppointmentType: appointmentType,
		Tags: tags,
		Version: !version || version?.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + `/assets/appointments/${appointmentId}`;
	return await put_(url, body, true, sessionId);
};

export const deleteAppointment = async (sessionId: string, appointmentId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/appointments/${appointmentId}`;
	return await delete_(url, true, sessionId);
};
