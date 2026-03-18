import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserAnalytics } from '../../../../api/services/user-analytics/user-analytics';
// import { redirect } from 'sveltekit-flash-message/server';
// import { errorMessage } from '$lib/utils/message.utils';
import { TimeHelper } from '$lib/utils/time.helper';
import { DateStringFormat } from '$lib/types/time.types';

////////////////////////////////////////////////////////////////////////////

const defaultGenericMetrics = {
    DailyActiveUsers: [],
    WeeklyActiveUsers: [],
    MonthlyActiveUsers: [],
    RetentionRateOnSpecificDays: { retention_on_specific_days: [] },
    RetentionRateInSpecificIntervals: { retention_in_specific_interval: [] },
    MostFiredEvents: [],
    MostFiredEventsByEventCategory: [],
    MostCommonlyVisitedFeatures: []
};

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId');
    // const userId = event.params.userId;

    if (!event.locals.sessionUser) {
        throw error(401, 'Unauthorized Access');
    }

    const roleName = event.locals.sessionUser.roleName;
    const isSystemAdmin = roleName === 'System admin' || roleName === 'System user';
    const explicitTenantCode = event.url.searchParams.get('tenantCode');
    const tenantCode = (isSystemAdmin && explicitTenantCode) ? explicitTenantCode : event.locals.sessionUser.tenantCode;

    let genericMetrics = defaultGenericMetrics;
    try {
        const today = new Date();
        const formattedDate = TimeHelper.getDateString(today, DateStringFormat.YYYY_MM_DD);
        const response = await getUserAnalytics(sessionId ?? '', formattedDate, tenantCode);
        if (response && response.Status !== 'Failure' && response.Data?.GenericMetrics) {
            genericMetrics = response.Data.GenericMetrics;
        }
    } catch (err) {
        console.error('Failed to fetch generic metrics:', err);
    }

    return {
        sessionId,
        genericMetrics,
        title: 'Dashboard-Home-Generic'
    };
};
