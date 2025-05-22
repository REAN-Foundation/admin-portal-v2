import { BACKEND_API_URL, FOLLOW_UP_URL } from "$env/static/private";
import { get_, post_ } from "../common";
import { get, post } from "./common";

///////////////////////////////////////////////////////////////////////////////

export const searchReportData = async (tenatCode: string, searchParams?: any) => {
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
	console.log('searchString', searchString);
	const url = FOLLOW_UP_URL + `/appointment-schedules/${tenatCode}/status-report/search${searchString}`;
	console.log('url---', url);
	return await get_(url, false);
};

export const createReminder = async (tenantCode: string, date: string) => {
	const body = {
		date: date
	};
	const url = FOLLOW_UP_URL + `/appointment-schedules/${tenantCode}/fetch-schedules-by-api`;
	return await post_(url, body, false);
};

export async function cancelAppointments(
	sessionId: string,
	dates: string[],
	tenantId: string,
	tenantName: string = null,
	message?: string 
) {
	const url = BACKEND_API_URL + '/follow-up/cancellations/';
	const body = {
		TenantId: tenantId,
		TenantName: tenantName,
		CancelDate: dates,
		Message : message
	};
	await post_(url, body, true, sessionId);
}

export async function viewCancelDates( sessionId: string, searchParams?: any) 
{
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
	const url = BACKEND_API_URL + `/follow-up/cancellations/search${searchString}`;
	await get_(url, true, sessionId);
}
