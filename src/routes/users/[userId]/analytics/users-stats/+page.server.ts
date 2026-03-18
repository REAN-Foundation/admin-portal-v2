import type { PageServerLoad } from './$types';

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

export const load: PageServerLoad = async (event) => {
    const parentData = await event.parent();
    const { sessionId, dailyStatsData } = parentData;

    const userStatistics = dailyStatsData;
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
