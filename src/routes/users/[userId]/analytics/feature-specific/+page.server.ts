
import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserAnalytics } from '../../../../api/services/user-analytics/user-analytics';
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
    const tenantCode = event.locals.sessionUser.tenantCode;
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
        title:'Dashboard-Home-Feature'
    };
};
