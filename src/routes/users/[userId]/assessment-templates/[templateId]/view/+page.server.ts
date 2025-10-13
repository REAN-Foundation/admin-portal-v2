import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchAssessmentNodes } from '../../../../../api/services/reancare/assessments/assessment-nodes';
import { getAssessmentTemplateById } from '../../../../../api/services/reancare/assessments/assessment-templates';
import { MAX_ITEMS_PER_PAGE } from '$lib/components/utils/helper';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
    const assessmentTemplateId = event.params.templateId;
    const searchParams = {
        templateId: assessmentTemplateId,
        itemsPerPage: MAX_ITEMS_PER_PAGE
    };
    const response = await getAssessmentTemplateById(sessionId, assessmentTemplateId);
    const _assessmentNodes = await searchAssessmentNodes(sessionId, searchParams);

    if (response.Status === 'failure' || response.HttpCode !== 200) {
        throw error(response.HttpCode, response.Message);
    }
    const assessmentTemplate = response?.Data?.AssessmentTemplate;
    const assessmentNodes = _assessmentNodes?.Data?.AssessmentNodeRecords?.Items;
    const id = response?.Data?.AssessmentTemplate?.id;

    return {
        location: `${id}/edit`,
        assessmentTemplate,
        assessmentNodes,
        message: response.Message,
        title:'Clinical-Assessments View'
    };		

};
