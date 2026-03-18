import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserAnalytics } from '../../../../api/services/user-analytics/user-analytics';
import { getDailyStatistics, getDailyTenantStatistics } from '../../../../api/services/reancare/statistics';
// import { redirect } from 'sveltekit-flash-message/server';
// import { errorMessage } from '$lib/utils/message.utils';
import { TimeHelper } from '$lib/utils/time.helper';
import { DateStringFormat } from '$lib/types/time.types';

////////////////////////////////////////////////////////////////////////////

const defaultUserCountStats = {
    TotalUsers: { Count: 0, Ratio: 0 },
    NotDeletedUsers: { Count: 0, Ratio: 0 },
    UsersWithActiveSession: { Count: 0, Ratio: 0 },
    DeletedUsers: { Count: 0, Ratio: 0 },
    EnrolledUsers: { Count: 0, Ratio: 0 }
};

const defaultBasicStatistics = {
    TotalUsers: 0,
    TotalPatients: 0,
    TotalActivePatients: 0,
    StartDate: null,
    EndDate: null,
    PatientRegistrationHistory: [],
    PatientDeregistrationHistory: [],
    UsersDistributionByRole: [],
    ActiveUsersCountAtEndOfMonth: []
};

const defaultData = {
    sessionId: '',
    basicStatistics: defaultBasicStatistics,
    overallUsersData: defaultUserCountStats,
    ageWiseUsers: [],
    genderWiseUsers: [],
    maritalStatusWiseUsers: [],
    majorAilment: [],
    addictionDistribution: [],
    deviceDetailWiseUsers: [],
    userCountStats: defaultUserCountStats,
    yearWiseAgeDetails: [],
    yearWiseGenderDetails: [],
    yearWiseMaritalDetails: [],
    yearWiseMajorAilmentDistributionDetails: [],
    yearWiseAddictionDistributionDetails: [],
    deviceDetailsByYears: [],
    years: [],
    tenantCode: '',
    tenantName: '',
    title: 'Dashboard-Home-Combined'
};

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId');
    // const userId = event.params.userId;

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

    // Use tenant from URL params (system admin) or session
    const explicitTenantCode = event.url.searchParams.get('tenantCode');
    const explicitTenantId = event.url.searchParams.get('tenantId');

    const tenantCode = (isSystemAdmin && explicitTenantCode) ? explicitTenantCode : event.locals.sessionUser.tenantCode;
    const tenantName = event.locals.sessionUser.tenantName;
    const effectiveTenantId = (isSystemAdmin && explicitTenantId) ? explicitTenantId : event.locals.sessionUser.tenantId;

    // Get User Analytics
    let basicStatistics = defaultBasicStatistics;
    try {
        const today = new Date();
        const formattedDate = TimeHelper.getDateString(today, DateStringFormat.YYYY_MM_DD);
        const response = await getUserAnalytics(sessionId ?? '', formattedDate ?? '', tenantCode);
        if (response && response.Status !== 'Failure' && response.Data?.BasicStatistics) {
            basicStatistics = response.Data.BasicStatistics;
        }
    } catch (err) {
        console.error('Failed to fetch user analytics:', err);
    }

    // User Stats Logic
    let userStatsResponse;
    try {
        if (isSystemAdmin && !explicitTenantId) {
            userStatsResponse = await getDailyStatistics(sessionId ?? '');
        } else {
            userStatsResponse = await getDailyTenantStatistics(sessionId ?? '', effectiveTenantId ?? '');
        }
    } catch (err) {
        console.error('Failed to fetch daily statistics:', err);
        return { ...defaultData, sessionId, basicStatistics, tenantCode, tenantName };
    }

    if (
        !userStatsResponse ||
        userStatsResponse.Status === 'failure' ||
        userStatsResponse.HttpCode !== 200 ||
        !userStatsResponse.Data?.DailyStatistics?.DashboardStats
    ) {
        return { ...defaultData, sessionId, basicStatistics, tenantCode, tenantName };
    }

    const userStatistics = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics;
    if (!userStatistics) {
        return { ...defaultData, sessionId, basicStatistics, tenantCode, tenantName };
    }

    const years: any[] = [];
    const yearWiseUserCount = userStatistics.YearWiseUserCount ?? [];
    yearWiseUserCount.forEach((value: any) => {
        years.push({
            year: value.year
        });
    });

    return {
        sessionId,
        basicStatistics,
        overallUsersData: userStatistics.UsersCountStats ?? defaultUserCountStats,
        ageWiseUsers: userStatistics.AgeWiseUsers ?? [],
        genderWiseUsers: userStatistics.GenderWiseUsers ?? [],
        maritalStatusWiseUsers: userStatistics.MaritalStatusWiseUsers ?? [],
        majorAilment: userStatistics.MajorAilmentDistribution ?? [],
        addictionDistribution: userStatistics.AddictionDistribution ?? [],
        deviceDetailWiseUsers: userStatistics.DeviceDetailWiseUsers ?? [],
        userCountStats: userStatistics.UsersCountStats ?? defaultUserCountStats,
        yearWiseAgeDetails: userStatistics.YearWiseAgeDetails ?? [],
        yearWiseGenderDetails: userStatistics.YearWiseGenderDetails ?? [],
        yearWiseMaritalDetails: userStatistics.YearWiseMaritalDetails ?? [],
        yearWiseMajorAilmentDistributionDetails: userStatistics.YearWiseMajorAilmentDistributionDetails ?? [],
        yearWiseAddictionDistributionDetails: userStatistics.YearWiseAddictionDistributionDetails ?? [],
        deviceDetailsByYears: userStatistics.YearWiseDeviceDetailDistribution ?? [],
        years,
        tenantCode,
        tenantName,
        title: 'Dashboard-Home-Combined'
    };
};
