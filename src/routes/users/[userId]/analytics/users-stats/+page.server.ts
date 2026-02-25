import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDailyStatistics, getDailyTenantStatistics } from '../../../../api/services/reancare/statistics';

////////////////////////////////////////////////////////////////////////////

const defaultUserCountStats = {
    TotalUsers: { Count: 0, Ratio: 0 },
    NotDeletedUsers: { Count: 0, Ratio: 0 },
    UsersWithActiveSession: { Count: 0, Ratio: 0 },
    DeletedUsers: { Count: 0, Ratio: 0 },
    EnrolledUsers: { Count: 0, Ratio: 0 }
};

const defaultData = {
    sessionId: '',
    ageWiseUsers: [],
    genderWiseUsers: [],
    maritalStatusWiseUsers: [],
    majorAilment: [],
    addictionDistribution: [],
    overallUsersData: defaultUserCountStats,
    deviceDetailWiseUsers: [],
    yearWiseAgeDetails: [],
    yearWiseGenderDetails: [],
    yearWiseMaritalDetails: [],
    yearWiseMajorAilmentDistributionDetails: [],
    yearWiseAddictionDistributionDetails: [],
    years: [],
    title: 'Dashboard-Home-Distribution'
};

export const load: PageServerLoad = async (event: RequestEvent) => {
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

    let response;
    try {
        if (roleName === 'System admin' || roleName === 'System user') {
            response = await getDailyStatistics(sessionId ?? '');
        } else {
            response = await getDailyTenantStatistics(sessionId ?? '', event.locals.sessionUser.tenantId ?? '');
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

    const userStatistics = response.Data.DailyStatistics.DashboardStats.UserStatistics;
    if (!userStatistics) {
        return { ...defaultData, sessionId };
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
        ageWiseUsers: userStatistics.AgeWiseUsers ?? [],
        genderWiseUsers: userStatistics.GenderWiseUsers ?? [],
        maritalStatusWiseUsers: userStatistics.MaritalStatusWiseUsers ?? [],
        majorAilment: userStatistics.MajorAilmentDistribution ?? [],
        addictionDistribution: userStatistics.AddictionDistribution ?? [],
        overallUsersData: userStatistics.UsersCountStats ?? defaultUserCountStats,
        deviceDetailWiseUsers: userStatistics.DeviceDetailWiseUsers ?? [],
        yearWiseAgeDetails: userStatistics.YearWiseAgeDetails ?? [],
        yearWiseGenderDetails: userStatistics.YearWiseGenderDetails ?? [],
        yearWiseMaritalDetails: userStatistics.YearWiseMaritalDetails ?? [],
        yearWiseMajorAilmentDistributionDetails: userStatistics.YearWiseMajorAilmentDistributionDetails ?? [],
        yearWiseAddictionDistributionDetails: userStatistics.YearWiseAddictionDistributionDetails ?? [],
        years,
        title: 'Dashboard-Home-Distribution'
    };
};
