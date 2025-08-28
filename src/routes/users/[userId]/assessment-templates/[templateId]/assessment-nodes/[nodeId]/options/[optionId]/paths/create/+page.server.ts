import { error, type ServerLoadEvent } from '@sveltejs/kit';
import { getOption, searchAssessmentNodes } from '$routes/api/services/reancare/assessments/assessment-nodes';
import type { PageServerLoad } from '../$types';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const templateId = event.params.templateId;
	const nodeId = event.params.nodeId;
	const optionId = event.params.optionId;

	const searchParams = {
		templateId: templateId,
		parentNodeId: nodeId
	};
	
	const response = await searchAssessmentNodes(sessionId, searchParams);

	const option = await getOption(sessionId, templateId, nodeId, optionId);
	if (option.Status === 'failure' || option.HttpCode !== 200) {
		throw error(option.HttpCode, option.Message);
	}
	
	if (response.Status === 'failure' || response.HttpCode !== 200) {
		throw error(response.HttpCode, response.Message);
	}
	
	const optionData = option?.Data?.Option;
	console.log('optionData', option);
	const allNodes = response?.Data?.AssessmentNodeRecords?.Items || [];
	const childNodes = allNodes.filter(node => node.ParentNodeId === nodeId);
	
	return {
		childNodes,
		sessionId,
		optionData,
		message: response.Message,
		title: 'Create Assessment Path'
	};
};
