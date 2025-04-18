import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserAnalytics } from '../../../../api/services/user-analytics/user-analytics';
import { getDailyStatistics, getDailyTenantStatistics } from '../../../../api/services/reancare/statistics';
import { redirect } from 'sveltekit-flash-message/server';
import { errorMessage } from '$lib/utils/message.utils';
import { TimeHelper } from '$lib/utils/time.helper';
import { DateStringFormat } from '$lib/types/time.types';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const userId = event.params.userId;
    const today = new Date();
    const formattedDate = TimeHelper.getDateString(today, DateStringFormat.YYYY_MM_DD);

    // Get User Analytics
    const response = await getUserAnalytics(sessionId ?? '', formattedDate ?? '');
    if (!response) {
        throw error(404, 'Daily user statistics data not found');
    }
    if (response.Status === 'Failure') {
        throw redirect(303, `/users/${userId}/home`,
            errorMessage('Latest basic statistics analytics report not available.'),
            event
        );
    }

    const basicStatistics = response.Data.BasicStatistics;

    // User Stats Logic
    let userStatsResponse;

    if (!event.locals.sessionUser) {
        throw error(401, 'Unauthorized Access');
    }

    if (event.locals.sessionUser.roleName === 'System admin' ||
        event.locals.sessionUser.roleName === 'System user'
    ) {
        userStatsResponse = await getDailyStatistics(sessionId ?? '');
    } else if (event.locals.sessionUser.roleName === 'Tenant admin' ||
        event.locals.sessionUser.roleName === 'Tenant user'
    ) {
        userStatsResponse = await getDailyTenantStatistics(sessionId ?? '', event.locals.sessionUser.tenantId ?? '');
    } else {
        throw error(401, 'Unauthorized Access');
    }

    if (!userStatsResponse) {
        throw error(404, 'Daily user statistics data not found');
    }
    if (userStatsResponse.Status === 'failure' || userStatsResponse.HttpCode !== 200) {
        throw error(userStatsResponse.HttpCode, userStatsResponse.Message);
    }

    const overallUsersData = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.UsersCountStats;
    const ageWiseUsers = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.AgeWiseUsers;
    const genderWiseUsers = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.GenderWiseUsers;
    const maritalStatusWiseUsers = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.MaritalStatusWiseUsers;
    // const countryWiseUsers = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.CountryWiseUsers;
    const majorAilment = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.MajorAilmentDistribution;
    const addictionDistribution = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.AddictionDistribution;
    const deviceDetailWiseUsers = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.DeviceDetailWiseUsers;
    const userCountStats = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.UsersCountStats;
    const deviceDetailsByYears = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.YearWiseDeviceDetailDistribution;

    const yearWiseAgeDetails = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.YearWiseAgeDetails;
    const yearWiseGenderDetails = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.YearWiseGenderDetails;
    const yearWiseMaritalDetails = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.YearWiseMaritalDetails;
    const yearWiseMajorAilmentDistributionDetails = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.YearWiseMajorAilmentDistributionDetails;
    const yearWiseAddictionDistributionDetails = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.YearWiseAddictionDistributionDetails;
    const years: any[] = [];
    const yearWiseUserCount = userStatsResponse.Data.DailyStatistics.DashboardStats.UserStatistics.YearWiseUserCount;
    yearWiseUserCount.forEach((value: any) => {
        years.push({
            year: value.year
        });
    });

    return {
        sessionId,
        basicStatistics,
        overallUsersData,
        ageWiseUsers,
        genderWiseUsers,
        maritalStatusWiseUsers,
        // countryWiseUsers,
        majorAilment,
        addictionDistribution,
        deviceDetailWiseUsers,
        userCountStats,
        yearWiseAgeDetails,
        yearWiseGenderDetails,
        yearWiseMaritalDetails,
        yearWiseMajorAilmentDistributionDetails,
        yearWiseAddictionDistributionDetails,
        deviceDetailsByYears,
        years,
        title: 'Dashboard-Home-Combined'
    };
};
