import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchAssessmentTemplates } from '$routes/api/services/reancare/assessments/assessment-templates';

////////////////////////////////////////////////////////////////////////////


export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const tenantId = event.locals.sessionUser?.tenantId;
    const response = await searchAssessmentTemplates(sessionId, {
    orderBy: 'Title',
    order: 'ascending'
});

    // const assessment = response?.Data;
    const id = response?.Data?.id;
    const assessmentTemplates = response?.Data?.AssessmentTemplateRecords?.Items ?? [];

    return {
        location: `${id}/edit`,
        assessmentTemplates,
        tenantId,
        message: response?.Message || 'assessment retrieved successfully',
        title: 'Assessment Edit'
    };
};

