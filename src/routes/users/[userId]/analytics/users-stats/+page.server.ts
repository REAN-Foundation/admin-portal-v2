import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDailyStatistics, getDailyTenantStatistics } from '../../../../api/services/reancare/statistics';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId');

    let response;

    if (! event.locals.sessionUser) {
        throw error (401, 'Unauthorized Access');
    }

    if (event.locals.sessionUser.roleName === 'System admin' ||
      event.locals.sessionUser.roleName === 'System user'
    ) {
        response = await getDailyStatistics(sessionId??'');
    } else if (event.locals.sessionUser.roleName === 'Tenant admin' ||
      event.locals.sessionUser.roleName === 'Tenant user'
    ) {
        response = await getDailyTenantStatistics(sessionId??'', event.locals.sessionUser.tenantId??'');
    } else {
        throw error (401, 'Unauthorized Access');
    }
    
    if (!response) {
        throw error(404, 'Daily user statistics data not found');
    }
    if (response.Status === 'failure' || response.HttpCode !== 200) {
        throw error(response.HttpCode, response.Message);
    }
    
    const overallUsersData = response.Data.DailyStatistics.DashboardStats.UserStatistics.UsersCountStats;
    const ageWiseUsers = response.Data.DailyStatistics.DashboardStats.UserStatistics.AgeWiseUsers;
    const genderWiseUsers = response.Data.DailyStatistics.DashboardStats.UserStatistics.GenderWiseUsers;
    const maritalStatusWiseUsers = response.Data.DailyStatistics.DashboardStats.UserStatistics.MaritalStatusWiseUsers;
    // const countryWiseUsers = response.Data.DailyStatistics.DashboardStats.UserStatistics.CountryWiseUsers;
    const majorAilment = response.Data.DailyStatistics.DashboardStats.UserStatistics.MajorAilmentDistribution;
    const addictionDistribution = response.Data.DailyStatistics.DashboardStats.UserStatistics.AddictionDistribution;
    const deviceDetailWiseUsers = response.Data.DailyStatistics.DashboardStats.UserStatistics.DeviceDetailWiseUsers;
    const yearWiseAgeDetails = response.Data.DailyStatistics.DashboardStats.UserStatistics.YearWiseAgeDetails;
    const yearWiseGenderDetails = response.Data.DailyStatistics.DashboardStats.UserStatistics.YearWiseGenderDetails;
    const yearWiseMaritalDetails = response.Data.DailyStatistics.DashboardStats.UserStatistics.YearWiseMaritalDetails;
    const yearWiseMajorAilmentDistributionDetails = response.Data.DailyStatistics.DashboardStats.UserStatistics.YearWiseMajorAilmentDistributionDetails;
    const yearWiseAddictionDistributionDetails = response.Data.DailyStatistics.DashboardStats.UserStatistics.YearWiseAddictionDistributionDetails;
    const years: any[] = [];
    const yearWiseUserCount = response.Data.DailyStatistics.DashboardStats.UserStatistics.YearWiseUserCount;
    yearWiseUserCount.forEach((value:any) => {
        years.push({
            year: value.year
        });
    });
    
    return {
        sessionId,
        ageWiseUsers,
        genderWiseUsers,
        maritalStatusWiseUsers,
        // countryWiseUsers,
        majorAilment,
        addictionDistribution,
        overallUsersData,
        deviceDetailWiseUsers,
        yearWiseAgeDetails,
        yearWiseGenderDetails,
        yearWiseMaritalDetails,
        yearWiseMajorAilmentDistributionDetails,
        yearWiseAddictionDistributionDetails,
        years,
        title:'Dashboard-Home-Distribution'
    };
};
