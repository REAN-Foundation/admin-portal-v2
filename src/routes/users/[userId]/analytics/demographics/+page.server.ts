import type { PageServerLoad } from './$types';

////////////////////////////////////////////////////////////////////////////

const defaultBasicStatistics = {
    PatientDemographics: {
        AgeGroups: [],
        GenderGroups: [],
        LocationGroups: [],
        EthnicityGroups: [],
        RaceGroups: [],
        HealthSystemDistribution: [],
        HospitalDistribution: [],
        SurvivorOrCareGiverDistribution: []
    }
};

export const load: PageServerLoad = async (event) => {
    const parentData = await event.parent();
    const { sessionId, analyticsData } = parentData;

    const basicStatistics = analyticsData?.BasicStatistics ?? defaultBasicStatistics;

    return {
        sessionId,
        basicStatistics,
        title: 'Dashboard-Home-Demographics'
    };
};
