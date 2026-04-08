import { error, type RequestEvent } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getUserAnalytics } from '../../../api/services/user-analytics/user-analytics';
import {
	getDailyStatistics,
	getDailyTenantStatistics
} from '../../../api/services/reancare/statistics';
import { TimeHelper } from '$lib/utils/time.helper';
import { DateStringFormat } from '$lib/types/time.types';
import { hasAnyAnalyticsData } from '$lib/utils/chart.utils';

export const load: LayoutServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');

	if (!event.locals.sessionUser) {
		throw error(401, 'Unauthorized Access');
	}

	const roleName = event.locals.sessionUser.roleName;
	if (
		roleName !== 'System admin' &&
		roleName !== 'System user' &&
		roleName !== 'Tenant admin' &&
		roleName !== 'Tenant user'
	) {
		throw error(401, 'Unauthorized Access');
	}

	const isSystemAdmin = roleName === 'System admin' || roleName === 'System user';

	// Determine effective tenant based on URL params (for system admin) or session
	const explicitTenantCode = event.url.searchParams.get('tenantCode');
	const explicitTenantId = event.url.searchParams.get('tenantId');

	const effectiveTenantCode = (isSystemAdmin && explicitTenantCode)
		? explicitTenantCode
		: event.locals.sessionUser.tenantCode;
	const effectiveTenantId = (isSystemAdmin && explicitTenantId)
		? explicitTenantId
		: event.locals.sessionUser.tenantId;

	const tenantName = event.locals.sessionUser.tenantName;

	// Fetch both APIs in parallel - single source of truth for all sub-pages
	const today = new Date();
	const formattedDate = TimeHelper.getDateString(today, DateStringFormat.YYYY_MM_DD);

	const [analyticsResult, dailyStatsResult] = await Promise.allSettled([
		getUserAnalytics(sessionId ?? '', formattedDate ?? '', effectiveTenantCode),
		isSystemAdmin && !explicitTenantId
			? getDailyStatistics(sessionId ?? '')
			: getDailyTenantStatistics(sessionId ?? '', effectiveTenantId ?? '')
	]);

	// Process analytics data (used by basic, demographics, overall, feature-specific)
	let analyticsData: any = null;
	if (analyticsResult.status === 'fulfilled') {
		const response = analyticsResult.value;
		if (response && response.Status !== 'Failure' && response.Data) {
			analyticsData = response.Data;
		}
	} else {
		console.error('Failed to fetch user analytics:', analyticsResult.reason);
	}

	// Process daily statistics (used by basic, users-stats)
	let dailyStatsData: any = null;
	if (dailyStatsResult.status === 'fulfilled') {
		const response = dailyStatsResult.value;
		if (
			response &&
			response.Status !== 'failure' &&
			response.HttpCode === 200 &&
			response.Data?.DailyStatistics?.DashboardStats?.UserStatistics
		) {
			dailyStatsData = response.Data.DailyStatistics.DashboardStats.UserStatistics;
		}
	} else {
		console.error('Failed to fetch daily statistics:', dailyStatsResult.reason);
	}

	const hasAnyFeatureData = hasAnyAnalyticsData(analyticsData, dailyStatsData);

	return {
		hasAnyFeatureData,
		effectiveTenantCode,
		effectiveTenantId,
		tenantName,
		sessionId,
		// Shared data for sub-pages
		analyticsData,
		dailyStatsData
	};
};
