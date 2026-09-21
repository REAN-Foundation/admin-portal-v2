import { BOT_WRAPPER_URL } from '$env/static/private';
import { TimeHelper } from '$lib/utils/time.helper';
import { DateStringFormat } from '$lib/types/time.types';
import { DashboardManager } from '../../cache/dashboard/dashboard.manager';
import { get } from './common.bot-wrapper';

////////////////////////////////////////////////////////////////

const buildRangeQuery = (range: string, startDate?: string, endDate?: string): string => {
	const params = new URLSearchParams({ range });
	if (range === 'custom') {
		if (startDate) params.set('startDate', startDate);
		if (endDate) params.set('endDate', endDate);
	}
	return params.toString();
};

const withDailyCache = async <T>(keyBase: string, fetcher: () => Promise<T>): Promise<T> => {
	const today = TimeHelper.getDateString(new Date(), DateStringFormat.YYYY_MM_DD);
	const todayKey = `${keyBase}:${today}`;
	const yesterdayKey = `${keyBase}:${TimeHelper.getYesterdayDate()}`;

	if (await DashboardManager.has(yesterdayKey)) {
		await DashboardManager.delete(yesterdayKey);
	}
	if (await DashboardManager.has(todayKey)) {
		return await DashboardManager.get(todayKey);
	}

	const result = await fetcher();
	await DashboardManager.set(todayKey, result);
	return result;
};

export const getDailySeries = async (
	sessionId: string,
	tenantCode: string,
	range: string,
	startDate?: string,
	endDate?: string
) => {
	const keyBase = `session-${sessionId}:bot-wrapper:daily-series:${tenantCode}:${range}:${startDate ?? ''}:${endDate ?? ''}`;
	return withDailyCache(keyBase, async () => {
		const url =
			BOT_WRAPPER_URL +
			`/v1/${tenantCode}/stats/daily-series?${buildRangeQuery(range, startDate, endDate)}`;
		return await get(url);
	});
};

export const getContentFrequency = async (
	sessionId: string,
	tenantCode: string,
	range: string,
	startDate?: string,
	endDate?: string,
	limit?: number
) => {
	const keyBase = `session-${sessionId}:bot-wrapper:content-frequency:${tenantCode}:${range}:${startDate ?? ''}:${endDate ?? ''}:${limit ?? ''}`;
	return withDailyCache(keyBase, async () => {
		const query = buildRangeQuery(range, startDate, endDate);
		const limitParam = limit ? `&limit=${limit}` : '';
		const url =
			BOT_WRAPPER_URL + `/v1/${tenantCode}/stats/content-frequency?${query}${limitParam}`;
		return await get(url);
	});
};

export const getLifetimeStats = async (sessionId: string, tenantCode: string) => {
	const keyBase = `session-${sessionId}:bot-wrapper:lifetime:${tenantCode}`;
	return withDailyCache(keyBase, async () => {
		const url = BOT_WRAPPER_URL + `/v1/${tenantCode}/stats/lifetime`;
		return await get(url);
	});
};
