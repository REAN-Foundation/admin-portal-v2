import type { PageServerLoad } from './$types';
import { error, type RequestEvent } from '@sveltejs/kit';
import {
	getDailySeries,
	getContentFrequency,
	getLifetimeStats
} from '../../../api/services/bot-wrapper/chat.stats';
import {
	getCustomStatsSummary,
	getCustomStatsUsers,
	isCustomStatsTenant
} from '../../../api/services/bot-wrapper/custom.stats';
import type {
	CustomStatsSummary,
	CustomStatsUsersPage,
	CustomUsersOrder,
	CustomUsersSortBy
} from '$lib/types/custom.stats.types';

//////////////////////////////////////////////////////////////////////////

const DEFAULT_RANGE = 'yearToDate';

const CUSTOM_USERS_PAGE_SIZE = 20;

const defaultData = {
	tenantSelected: false,
	tenantCode: '',
	range: DEFAULT_RANGE,
	startDate: '',
	endDate: '',
	series: [],
	uniqueContentCount: 0,
	topContent: [],
	lifetimeInteractions: 0,
	lifetimeUniqueUsers: 0,
	// Custom stats (only for tenants in CUSTOM_STATS_TENANTS)
	isCustomTenant: false,
	customSummary: null as CustomStatsSummary | null,
	customUsers: null as CustomStatsUsersPage | null,
	usersSortBy: 'interactions' as CustomUsersSortBy,
	usersOrder: 'desc' as CustomUsersOrder
};

// Custom dashboard for tenants listed in CUSTOM_STATS_TENANTS (replaces the common cards/charts).
const loadCustomStats = async (
	event: RequestEvent,
	sessionId: string,
	tenantCode: string,
	range: string,
	startDate: string,
	endDate: string
) => {
	const params = event.url.searchParams;
	const usersPage = Math.max(1, parseInt(params.get('usersPage') ?? '1', 10) || 1);
	const usersSortBy: CustomUsersSortBy =
		params.get('usersSortBy') === 'firstMessageOn' ? 'firstMessageOn' : 'interactions';
	const usersOrder: CustomUsersOrder = params.get('usersOrder') === 'asc' ? 'asc' : 'desc';

	const [summaryResult, usersResult] = await Promise.allSettled([
		getCustomStatsSummary(sessionId, tenantCode, range, startDate, endDate),
		getCustomStatsUsers(
			sessionId,
			tenantCode,
			range,
			startDate,
			endDate,
			usersPage,
			CUSTOM_USERS_PAGE_SIZE,
			usersSortBy,
			usersOrder
		)
	]);

	let customSummary: CustomStatsSummary | null = null;
	if (summaryResult.status === 'fulfilled' && summaryResult.value?.success) {
		customSummary = summaryResult.value.data ?? null;
	} else {
		console.error(
			'Failed to fetch custom stats summary:',
			summaryResult.status === 'rejected' ? summaryResult.reason : summaryResult.value?.message
		);
	}

	let customUsers: CustomStatsUsersPage | null = null;
	if (usersResult.status === 'fulfilled' && usersResult.value?.success) {
		customUsers = usersResult.value.data ?? null;
	} else {
		console.error(
			'Failed to fetch custom stats users:',
			usersResult.status === 'rejected' ? usersResult.reason : usersResult.value?.message
		);
	}

	return {
		...defaultData,
		tenantSelected: true,
		tenantCode,
		range,
		startDate,
		endDate,
		isCustomTenant: true,
		customSummary,
		customUsers,
		usersSortBy,
		usersOrder
	};
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

	const isSystemAdmin = roleName === 'System admin' || roleName === 'System user';
	const explicitTenantCode = event.url.searchParams.get('tenantCode');
	const tenantCode = isSystemAdmin
		? (explicitTenantCode ?? '')
		: (event.locals.sessionUser.tenantCode ?? '');

	const range = event.url.searchParams.get('range') || DEFAULT_RANGE;
	const startDate = event.url.searchParams.get('startDate') ?? '';
	const endDate = event.url.searchParams.get('endDate') ?? '';

	// Bot-wrapper's stats API has no all-tenants aggregate - a tenant Code is required
	// for every call, unlike the REANCARE person-stats APIs used by platform-overview.
	if (!tenantCode) {
		return { ...defaultData, range, startDate, endDate };
	}

	if (isCustomStatsTenant(tenantCode)) {
		return await loadCustomStats(event, sessionId, tenantCode, range, startDate, endDate);
	}

	const [seriesResult, contentResult, lifetimeResult] = await Promise.allSettled([
		getDailySeries(sessionId, tenantCode, range, startDate, endDate),
		getContentFrequency(sessionId, tenantCode, range, startDate, endDate),
		getLifetimeStats(sessionId, tenantCode)
	]);

	let series = [];
	if (seriesResult.status === 'fulfilled' && seriesResult.value?.success) {
		series = seriesResult.value.data?.series ?? [];
	} else if (seriesResult.status === 'rejected') {
		console.error('Failed to fetch chat daily series:', seriesResult.reason);
	}

	let uniqueContentCount = 0;
	let topContent = [];
	if (contentResult.status === 'fulfilled' && contentResult.value?.success) {
		uniqueContentCount = contentResult.value.data?.uniqueContentCount ?? 0;
		topContent = contentResult.value.data?.topContent ?? [];
	} else if (contentResult.status === 'rejected') {
		console.error('Failed to fetch chat content frequency:', contentResult.reason);
	}

	let lifetimeInteractions = 0;
	let lifetimeUniqueUsers = 0;
	if (lifetimeResult.status === 'fulfilled' && lifetimeResult.value?.success) {
		lifetimeInteractions = lifetimeResult.value.data?.lifetimeInteractions ?? 0;
		lifetimeUniqueUsers = lifetimeResult.value.data?.lifetimeUniqueUsers ?? 0;
	} else if (lifetimeResult.status === 'rejected') {
		console.error('Failed to fetch lifetime chat stats:', lifetimeResult.reason);
	}

	return {
		...defaultData,
		tenantSelected: true,
		tenantCode,
		range,
		startDate,
		endDate,
		series,
		uniqueContentCount,
		topContent,
		lifetimeInteractions,
		lifetimeUniqueUsers
	};
};
