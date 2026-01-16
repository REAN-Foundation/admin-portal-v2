import { USER_ANALYTICS_API_URL } from '$env/static/private';
import { API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { TimeHelper } from '$lib/utils/time.helper';
import { DashboardManager } from '../../cache/dashboard/dashboard.manager';
import { get } from '../reancare/common.reancare';

///////////////////////////////////////////////////////////////////////////////

export const getAnalyticsReport = async(format: string) => {
    const url = USER_ANALYTICS_API_URL + `/analytics/download/${new Date().toISOString().split('T')[0]}-1/formats/${format}`;
	const headers:any = {};
	headers['x-api-key'] = API_CLIENT_INTERNAL_KEY;
	const response = await fetch(url, {
		method: 'GET',
		headers
	});
    if (response.ok){
        return response;
    }
    return null;
}

export const getUserAnalytics = async (sessionId: string, formattedDate: string, tenantCode: string) => {
	console.log('Formatted date: ' + formattedDate);
	const url = USER_ANALYTICS_API_URL + `/analytics/metrics/${formattedDate}-${tenantCode}-1`;
	const cacheKey = `session-${sessionId}:req-getUserAnalytics:${formattedDate}-${tenantCode}-1`;
	const yesterday = TimeHelper.getYesterdayDate();
	const yesterdayCacheKey = `session-${sessionId}:req-getUserAnalytics:${yesterday}-${tenantCode}-1`;

	if (await DashboardManager.has(yesterdayCacheKey)) {
		await DashboardManager._cache.delete(yesterdayCacheKey);
		console.log(`Cleared old key: ${yesterdayCacheKey}`);
	}

	if (await DashboardManager.has(cacheKey)) {
		return await DashboardManager.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	await DashboardManager.set(cacheKey, result);
	return result;
};
