import { error, type RequestEvent } from '@sveltejs/kit';
import { getAssessmentTemplateById } from '../../../../../../../api/services/reancare/assessments/assessment-templates';
import type { PageServerLoad } from './$types';
import { getAssessmentNodeById } from '../../../../../../../api/services/reancare/assessments/assessment-nodes';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const assessmentNodeId = event.params.nodeId;
	const templateId = event.params.templateId;
	const response = await getAssessmentNodeById(sessionId, templateId, assessmentNodeId);
	const templateDetails_ = await getAssessmentTemplateById(sessionId, templateId);
	const templateDetails = templateDetails_.Data.AssessmentTemplate;

	if (response.Status === 'failure' || response.HttpCode !== 200) {
		throw error(response.HttpCode, response.Message);
	}
	const assessmentNode = response?.Data?.AssessmentNode;
	const id = response?.Data?.AssessmentNode?.id;
	return {
		location: `${id}/edit`,
		assessmentNode,
		sessionId,
		templateDetails,
		message: response.Message,
		title: 'Clinical-Assessments-Assessment Nodes View'
	};


};
