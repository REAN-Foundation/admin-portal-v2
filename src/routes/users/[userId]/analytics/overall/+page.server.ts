import type { PageServerLoad } from './$types';

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

export const load: PageServerLoad = async (event) => {
    const parentData = await event.parent();
    const { sessionId, analyticsData } = parentData;

    const genericMetrics = analyticsData?.GenericMetrics ?? defaultGenericMetrics;

    return {
        sessionId,
        genericMetrics,
        title: 'Dashboard-Home-Generic'
    };
};
