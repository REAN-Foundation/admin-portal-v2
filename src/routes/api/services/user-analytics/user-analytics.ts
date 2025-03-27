import { USER_ANALYTICS_API_URL } from '$env/static/private';
import { API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { CacheService } from '$lib/server/cache/cache.service';
import { TimeHelper } from '$lib/utils/time.helper';
import { get } from '../reancare/common.reancare';

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

export const getUserAnalytics = async (sessionId: string, formattedDate: string) => {
	console.log('Formatted date: ' + formattedDate);
	const url = USER_ANALYTICS_API_URL + `/analytics/metrics/${formattedDate}-1`;
	const cacheKey = `session-${sessionId}:req-getUserAnalytics:${formattedDate}-1`;
	const yesterday = TimeHelper.getYesterdayDate();
	const yesterdayCacheKey = `session-${sessionId}:req-getUserAnalytics:${yesterday}-1`;

	if (await CacheService.has(yesterdayCacheKey)) {
		await CacheService._cache.delete(yesterdayCacheKey);
		console.log(`Cleared old key: ${yesterdayCacheKey}`);
	}

	if (await CacheService.has(cacheKey)) {
		return await CacheService.get(cacheKey);
	}

	const result = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	await CacheService.set(cacheKey, result);
	return result;
};
