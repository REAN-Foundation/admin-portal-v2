import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { searchAssessmentNodes } from '../../../../../api/services/reancare/assessments/assessment-nodes';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    event.depends('app:assessment-nodes');
    const templateId = event.params.templateId;
    const searchParams = {
        templateId: templateId
    };
    const response = await searchAssessmentNodes(sessionId, searchParams);
    if (response.Status === 'failure' || response.HttpCode !== 200) {
        throw error(response.HttpCode, response.Message);
    }
    const assessmentNodes = response?.Data?.AssessmentNodeRecords || [];

    return {
        assessmentNodes,
        sessionId,
        message: response.Message,
        title:'Clinical-Assessments-Assessment Nodes'
    };		

};
