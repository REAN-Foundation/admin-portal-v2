import type { PageServerLoad } from './$types';

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

export const load: PageServerLoad = async (event) => {
    const parentData = await event.parent();
    const { sessionId, analyticsData, dailyStatsData, effectiveTenantCode, tenantName } = parentData;

    const basicStatistics = analyticsData?.BasicStatistics ?? defaultBasicStatistics;
    const userStatistics = dailyStatsData;

    if (!userStatistics) {
        return { ...defaultData, sessionId, basicStatistics, tenantCode: effectiveTenantCode, tenantName };
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
        tenantCode: effectiveTenantCode,
        tenantName,
        title: 'Dashboard-Home-Combined'
    };
};
