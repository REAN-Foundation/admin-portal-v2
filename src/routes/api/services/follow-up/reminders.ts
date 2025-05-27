import { FOLLOW_UP_URL } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { get_, post_ } from '../common';
// import { get} from '../reancare/common.reancare';

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
	const url =
		FOLLOW_UP_URL + `/appointment-schedules/${tenatCode}/status-report/search${searchString}`;
	console.log('url---', url);
	const cacheKey = `session-${tenatCode}:req-searchReportData:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}
	const result = await get_(url, false);
	await DashboardManager.set(cacheKey, result);
	return result;
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
	date: string,
	tenantId: string,
	tenantCode: string,
	message?: string
) {
	const url = FOLLOW_UP_URL + '/appointment-cancellations/';
	const body = {
		tenant_id : tenantId,
		tenant_code: tenantCode,
		cancel_date: date,
		message: message
	};

	const result = await post_( url, body, false);

	const findAndClearKeys = [`session-${sessionId}:req-viewCancellations`];
	await DashboardManager.findAndClear(findAndClearKeys);
	console.log('result-------', result);
	return result;
}

export async function viewCancellations(sessionId: string, searchParams?: any) {
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
	
	const url = FOLLOW_UP_URL + `/appointment-cancellations/search${searchString}`;
	const cacheKey = `session-${sessionId}:req-viewCancellations:${searchString}`;
	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}
	const result = await get_( url, false);
	await DashboardManager.set(cacheKey, result);
	return result;
}
