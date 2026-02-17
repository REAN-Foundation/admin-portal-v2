
import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserAnalytics } from '../../../../api/services/user-analytics/user-analytics';
import { redirect } from 'sveltekit-flash-message/server';
import { errorMessage } from '$lib/utils/message.utils';
import { TimeHelper } from '$lib/utils/time.helper';
import { DateStringFormat } from '$lib/types/time.types';
import { searchCareplan } from '$routes/api/services/careplan/careplans';
import { createSearchFilters } from '$lib/utils/search.utils';
import { MAX_ITEMS_PER_PAGE } from '$lib/components/utils/helper';
import { searchAssessmentTemplates } from '$routes/api/services/reancare/assessments/assessment-templates';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const userId = event.params.userId;
    const today = new Date();
    const formattedDate = TimeHelper.getDateString(today, DateStringFormat.YYYY_MM_DD);
    const tenantCode = event.locals.sessionUser.tenantCode;
    
    // Get tenantSettings from parent layout
    const parentData = await event.parent();
    const tenantSettings = parentData?.tenantSettings;
    
    const response = await getUserAnalytics(sessionId, formattedDate, tenantCode)
    if (!response) {
        throw error(404, 'Daily user statistics data not found');
    }
    if (response.Status === 'Failure') {
        throw redirect(303, `/users/${userId}/home`,
            errorMessage('Latest feature statistics analytics report not available.'),
            event
        );
    }
    const data = response.Data;
    const medicationManagementdata = data.MedicationManagementMetrics?.[0] ?? {};
    const healthJourneyWiseTask = data.HealthJourneyMetrics?.CareplanSpecific?.HealthJourneyWiseTask ?? [];
    const healthJourneyWiseCompletedTask =
        data.HealthJourneyMetrics?.CareplanSpecific?.HealthJourneyWiseCompletedTask ?? [];
    const overallHealthJourneyTaskData = data.HealthJourneyMetrics?.Overall ?? {};
    const patientTaskMetrics = data.PatientTaskMetrics ?? {};
    const vitalMetrics = data.VitalMetrics ?? [];
    const assessmentMetrics = data.AssessmentMetrics ?? {};

    const careplans = await getTenantCareplans(event, sessionId);
    assessmentMetrics.CareplanWiseAssessmentCompletionCount = assessmentMetrics.CareplanWiseAssessmentCompletionCount?.filter((assessment => careplans.includes(assessment.care_plan_code)));

    const assessments = await getAssessments(event, sessionId);
    assessmentMetrics.AssessmentQueryResponseDetails = assessmentMetrics.AssessmentQueryResponseDetails?.filter((item => assessments.includes(item.assessment_template_title)));
    assessmentMetrics.MultipleChoiceResponseOptionDetails = assessmentMetrics.MultipleChoiceResponseOptionDetails?.filter((item => assessments.includes(item.assessment_template_title)));
    return {
        sessionId,
        statistics: response.Data,
        medicationManagementdata,
        healthJourneyWiseTask,
        healthJourneyWiseCompletedTask,
        overallHealthJourneyTaskData,
        patientTaskMetrics,
        vitalMetrics,
        assessmentMetrics,
        tenantSettings,
        title:'Dashboard-Home-Feature'
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
    const carePlans = response?.Data?.Items.map(item => item.Code) || [];
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
            return response?.Data?.AssessmentTemplateRecords?.Items.map(item => item.Title) || [];
        } catch (err) {
            console.error('Error fetching assessment templates:', err);
            return [];
        }
    }
