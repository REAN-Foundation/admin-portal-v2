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

	const tenantCode = event.locals.sessionUser.tenantCode;

	// Fetch user analytics data (covers basic, demographics, overall, feature-specific tabs)
	let analyticsData: any = null;
	try {
		const today = new Date();
		const formattedDate = TimeHelper.getDateString(today, DateStringFormat.YYYY_MM_DD);
		const response = await getUserAnalytics(sessionId ?? '', formattedDate ?? '', tenantCode);
		if (response && response.Status !== 'Failure' && response.Data) {
			analyticsData = response.Data;
		}
	} catch (err) {
		console.error('Failed to fetch user analytics for data availability check:', err);
	}

	// Fetch daily statistics data (covers basic and users-stats tabs)
	let dailyStatsData: any = null;
	try {
		let response;
		if (roleName === 'System admin' || roleName === 'System user') {
			response = await getDailyStatistics(sessionId ?? '');
		} else {
			response = await getDailyTenantStatistics(
				sessionId ?? '',
				event.locals.sessionUser.tenantId ?? ''
			);
		}
		if (
			response &&
			response.Status !== 'failure' &&
			response.HttpCode === 200 &&
			response.Data?.DailyStatistics?.DashboardStats?.UserStatistics
		) {
			dailyStatsData = response.Data.DailyStatistics.DashboardStats.UserStatistics;
		}
	} catch (err) {
		console.error('Failed to fetch daily statistics for data availability check:', err);
	}

	const hasAnyFeatureData = hasAnyAnalyticsData(analyticsData, dailyStatsData);

	return {
		hasAnyFeatureData
	};
};
