import { BOT_WRAPPER_URL } from '$env/static/private';
import { TimeHelper } from '$lib/utils/time.helper';
import { DateStringFormat } from '$lib/types/time.types';
import type { CustomUsersOrder, CustomUsersSortBy } from '$lib/types/custom.stats.types';
import { DashboardManager } from '../../cache/dashboard/dashboard.manager';
import { get } from './common.bot-wrapper';

////////////////////////////////////////////////////////////////
const CUSTOM_STATS_TENANTS = ['Testing30', 'LOVE_MATTERS'];

export const getCustomStatsTenants = (): string[] => {
	return [...CUSTOM_STATS_TENANTS];
};

// // Temporary default, used only when CUSTOM_STATS_TENANTS is missing or empty in the env.
// const DEFAULT_CUSTOM_STATS_TENANTS = ['Testing30', 'LOVE_MATTERS'];
//
// // CUSTOM_STATS_TENANTS: JSON array of tenant codes, e.g. CUSTOM_STATS_TENANTS=["LOVE_MATTERS"].
// // Codes are matched exactly as written (case-sensitive). Read at runtime, so a missing
// // variable never breaks the build.
// export const getCustomStatsTenants = (): string[] => {
// 	const raw = env.CUSTOM_STATS_TENANTS ?? '';
// 	if (!raw.trim()) {
// 		return [...DEFAULT_CUSTOM_STATS_TENANTS];
// 	}
// 	let value: unknown = null;
// 	try {
// 		value = JSON.parse(raw);
// 	} catch {
// 		value = null;
// 	}
// 	if (Array.isArray(value)) {
// 		return value.filter((code) => typeof code === 'string' && code.length > 0);
// 	}
// 	console.warn(
// 		`CUSTOM_STATS_TENANTS must be a JSON array of tenant codes, e.g. ["LOVE_MATTERS"]. Got: ${raw}`
// 	);
// 	return [];
// };

export const isCustomStatsTenant = (tenantCode?: string | null): boolean => {
	return !!tenantCode && getCustomStatsTenants().includes(tenantCode);
};

////////////////////////////////////////////////////////////////

const buildRangeQuery = (range: string, startDate?: string, endDate?: string): string => {
	const params = new URLSearchParams({ range });
	if (range === 'custom') {
		if (startDate) params.set('startDate', startDate);
		if (endDate) params.set('endDate', endDate);
	}
	return params.toString();
};

const withDailyCache = async (keyBase: string, fetcher: () => Promise<any>): Promise<any> => {
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
	if (result?.success) {
		await DashboardManager.set(todayKey, result);
	}
	return result;
};

export const getCustomStatsSummary = async (
	sessionId: string,
	tenantCode: string,
	range: string,
	startDate?: string,
	endDate?: string
) => {
	const keyBase = `session-${sessionId}:bot-wrapper:custom-summary:${tenantCode}:${range}:${startDate ?? ''}:${endDate ?? ''}`;
	return withDailyCache(keyBase, async () => {
		const url =
			BOT_WRAPPER_URL +
			`/v1/${tenantCode}/stats/custom/summary?${buildRangeQuery(range, startDate, endDate)}`;
		return await get(url);
	});
};

export const getCustomStatsUsers = async (
	sessionId: string,
	tenantCode: string,
	range: string,
	startDate: string | undefined,
	endDate: string | undefined,
	page: number,
	pageSize: number,
	sortBy: CustomUsersSortBy,
	order: CustomUsersOrder
) => {
	const keyBase =
		`session-${sessionId}:bot-wrapper:custom-users:${tenantCode}:${range}:${startDate ?? ''}:${endDate ?? ''}` +
		`:${page}:${pageSize}:${sortBy}:${order}`;
	return withDailyCache(keyBase, async () => {
		const params = new URLSearchParams(buildRangeQuery(range, startDate, endDate));
		params.set('page', String(page));
		params.set('pageSize', String(pageSize));
		params.set('sortBy', sortBy);
		params.set('order', order);
		const url = BOT_WRAPPER_URL + `/v1/${tenantCode}/stats/custom/users?${params.toString()}`;
		return await get(url);
	});
};
