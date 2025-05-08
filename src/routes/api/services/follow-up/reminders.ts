import { BACKEND_API_URL, FOLLOW_UP_URL } from '$env/static/private';
import { get_, post_ } from '../common';

///////////////////////////////////////////////////////////////////////////////

export const searchReportData = async (tenatCode: string, date: string, searchParams?: any) => {
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
	const url = FOLLOW_UP_URL + `/appointment-schedules/${tenatCode}/status-report/${date}`;
	return await get_(url, false);
};

export const createReminder = async (tenantCode: string, date: string) => {
	const body = {
		date: date
	};
	const url = FOLLOW_UP_URL + `/appointment-schedules/${tenantCode}/fetch-schedules-by-api`;
	return await post_(url, body, true);
};

export async function cancelReminder(
	sessionId: string,
	date: string,
	tenantId: string,
	tenantName: string = null
) {
	const url = BACKEND_API_URL + '/follow-up/cancellations/';
	const body = {
		TenantId: tenantId,
		TenantName: tenantName,
		CancelDate: date
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
