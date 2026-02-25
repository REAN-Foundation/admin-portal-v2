import type { PageServerLoad } from '../home/$types';
import { error, type RequestEvent } from '@sveltejs/kit';
import {
	getDailyStatistics,
	getDailyTenantStatistics
} from '../../../api/services/reancare/statistics';
// import { TimeHelper } from '$lib/utils/time.helper';
// import { DateStringFormat } from '$lib/types/time.types';
// import { getUserAnalytics } from '../../../api/services/user-analytics/user-analytics';

//////////////////////////////////////////////////////////////////////////

const defaultUserCountStats = {
	TotalUsers: { Count: 0, Ratio: 0 },
	NotDeletedUsers: { Count: 0, Ratio: 0 },
	UsersWithActiveSession: { Count: 0, Ratio: 0 },
	DeletedUsers: { Count: 0, Ratio: 0 },
	EnrolledUsers: { Count: 0, Ratio: 0 }
};

const defaultData = {
	sessionId: '',
	userCountStats: defaultUserCountStats,
	userCountByYears: [],
	deviceDetailsStats: [],
	deviceDetailsByYears: [],
	title: 'Dashboard-Home-Overall'
};

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId: any = event.cookies.get('sessionId');

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

	let response;
	try {
		if (roleName === 'System admin' || roleName === 'System user') {
			response = await getDailyStatistics(sessionId);
		} else {
			response = await getDailyTenantStatistics(
				sessionId,
				event.locals.sessionUser.tenantId ?? ''
			);
		}
	} catch (err) {
		console.error('Failed to fetch daily statistics:', err);
		return { ...defaultData, sessionId };
	}

	if (
		!response ||
		response.Status === 'failure' ||
		response.HttpCode !== 200 ||
		!response.Data?.DailyStatistics?.DashboardStats
	) {
		return { ...defaultData, sessionId };
	}

	const stats = response.Data.DailyStatistics.DashboardStats;
	const userStatistics = stats.UserStatistics;

	return {
		sessionId,
		userCountStats: userStatistics?.UsersCountStats ?? defaultUserCountStats,
		userCountByYears: userStatistics?.YearWiseUserCount ?? [],
		deviceDetailsStats: userStatistics?.DeviceDetailWiseUsers ?? [],
		deviceDetailsByYears: userStatistics?.YearWiseDeviceDetails ?? [],
		title: 'Dashboard-Home-Overall'
	};
};
