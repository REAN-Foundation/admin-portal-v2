import { CAREPLAN_BACKEND_API_URL } from '$env/static/private';
import { delete_, get_, post_, put_ } from '../../common';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';

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
		Version: !version || version.length === 0 ? 'V 1.0' : version
	};
	const url = CAREPLAN_BACKEND_API_URL + '/assets/appointments';
	const result = await post_(url, body, true, sessionId);

	// Invalidate cached search results
	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAppointments`]);

	return result;
};

export const getAppointmentById = async (sessionId: string, appointmentId: string) => {
	const cacheKey = `session-${sessionId}:req-getAppointmentById-${appointmentId}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/appointments/${appointmentId}`;
	const result = await get_(url, true, sessionId);

	await DashboardManager.set(cacheKey, result);
	return result;
};

export const searchAppointments = async (
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

	const cacheKey = `session-${sessionId}:req-searchAppointments:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const url = CAREPLAN_BACKEND_API_URL + `/assets/appointments/search${searchString}`;
	const result = await get_(url, true, sessionId);

	await DashboardManager.set(cacheKey, result);
	return result;
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
		Version: !version || version.length === 0 ? 'V 1.0' : version
	};

	const url = CAREPLAN_BACKEND_API_URL + `/assets/appointments/${appointmentId}`;
	const result = await put_(url, body, true, sessionId);

	await DashboardManager.deleteMany([
		`session-${sessionId}:req-getAppointmentById-${appointmentId}`
	]);

	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAppointments`]);

	return result;
};

export const deleteAppointment = async (sessionId: string, appointmentId: string) => {
	const url = CAREPLAN_BACKEND_API_URL + `/assets/appointments/${appointmentId}`;
	const result = await delete_(url, true, sessionId);

	await DashboardManager.deleteMany([
		`session-${sessionId}:req-getAppointmentById-${appointmentId}`
	]);

	await DashboardManager.findAndClear([`session-${sessionId}:req-searchAppointments`]);

	return result;
};
