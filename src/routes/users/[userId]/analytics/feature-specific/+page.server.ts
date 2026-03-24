
import { type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchCareplan } from '$routes/api/services/careplan/careplans';
import { createSearchFilters } from '$lib/utils/search.utils';
import { MAX_ITEMS_PER_PAGE } from '$lib/components/utils/helper';
import { searchAssessmentTemplates } from '$routes/api/services/reancare/assessments/assessment-templates';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const parentData = await event.parent();
    const { sessionId, analyticsData } = parentData;

    // Get tenantSettings from parent layout
    const tenantSettings = parentData?.tenantSettings;

    const defaultReturn = {
        sessionId,
        statistics: { FeatureMetrics: [] },
        medicationManagementdata: {},
        healthJourneyWiseTask: [],
        healthJourneyWiseCompletedTask: [],
        overallHealthJourneyTaskData: {},
        patientTaskMetrics: {},
        vitalMetrics: [],
        assessmentMetrics: {},
        tenantSettings,
        title: 'Dashboard-Home-Feature'
    };

    if (!analyticsData) {
        return defaultReturn;
    }

    const data = analyticsData;
    const medicationManagementdata = data.MedicationManagementMetrics?.[0] ?? {};
    const healthJourneyWiseTask = data.HealthJourneyMetrics?.CareplanSpecific?.HealthJourneyWiseTask ?? [];
    const healthJourneyWiseCompletedTask =
        data.HealthJourneyMetrics?.CareplanSpecific?.HealthJourneyWiseCompletedTask ?? [];
    const overallHealthJourneyTaskData = data.HealthJourneyMetrics?.Overall ?? {};
    const patientTaskMetrics = data.PatientTaskMetrics ?? {};
    const vitalMetrics = data.VitalMetrics ?? [];
    const assessmentMetrics = data.AssessmentMetrics ?? {};

    // Fetch careplans and assessments in parallel
    const [careplans, assessments] = await Promise.all([
        getTenantCareplans(event, sessionId),
        getAssessments(event, sessionId)
    ]);

    assessmentMetrics.CareplanWiseAssessmentCompletionCount = assessmentMetrics.CareplanWiseAssessmentCompletionCount?.filter((assessment: any) => careplans.includes(assessment.care_plan_code));
    assessmentMetrics.AssessmentQueryResponseDetails = assessmentMetrics.AssessmentQueryResponseDetails?.filter((item: any) => assessments.includes(item.assessment_template_title));
    assessmentMetrics.MultipleChoiceResponseOptionDetails = assessmentMetrics.MultipleChoiceResponseOptionDetails?.filter((item: any) => assessments.includes(item.assessment_template_title));

    return {
        sessionId,
        statistics: analyticsData,
        medicationManagementdata,
        healthJourneyWiseTask,
        healthJourneyWiseCompletedTask,
        overallHealthJourneyTaskData,
        patientTaskMetrics,
        vitalMetrics,
        assessmentMetrics,
        tenantSettings,
        title: 'Dashboard-Home-Feature'
    };
};

const getTenantCareplans = async (event: RequestEvent, sessionId: string) => {
    try {
    const searchFilters = createSearchFilters(event, {
            orderBy: 'Name',
            order: 'ascending',
            itemsPerPage: MAX_ITEMS_PER_PAGE
        });

    const response = await searchCareplan(sessionId, searchFilters);
    const carePlans = response?.Data?.Items.map((item: any) => item.Code) || [];
    return carePlans;
    } catch (err) {
        console.error('Error fetching care plans:', err);
        return [];
    }
}

const getAssessments = async (event: RequestEvent, sessionId: string) => {
    try {
         const searchFilters = createSearchFilters(event, {
                orderBy: "Title",
                order: "ascending",
                itemsPerPage: MAX_ITEMS_PER_PAGE
            });

            const response = await searchAssessmentTemplates(sessionId, searchFilters);
            return response?.Data?.AssessmentTemplateRecords?.Items.map((item: any) => item.Title) || [];
        } catch (err) {
            console.error('Error fetching assessment templates:', err);
            return [];
        }
    }
