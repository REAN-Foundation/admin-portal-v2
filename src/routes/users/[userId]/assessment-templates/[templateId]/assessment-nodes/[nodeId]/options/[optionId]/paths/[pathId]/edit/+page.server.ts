import { error, type ServerLoadEvent } from '@sveltejs/kit';
import { getOption, searchAssessmentNodes } from '$routes/api/services/reancare/assessments/assessment-nodes';
import { getAssessmentPathById } from '$routes/api/services/reancare/assessments/assessment-paths';
import type { PageServerLoad } from './$types';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const templateId = event.params.templateId;
	const nodeId = event.params.nodeId;
	const optionId = event.params.optionId;
	const pathId = event.params.pathId;

	if (!sessionId) {
		throw error(401, 'Access denied: Invalid session.');
	}

	try {
		const pathResponse = await getAssessmentPathById(sessionId, templateId, nodeId, pathId);
		if (pathResponse.Status === 'failure' || pathResponse.HttpCode !== 200) {
			throw error(pathResponse.HttpCode || 500, pathResponse.Message || 'Failed to fetch path data');
		}

		const optionResponse = await getOption(sessionId, templateId, nodeId, optionId);
		if (optionResponse.Status === 'failure' || optionResponse.HttpCode !== 200) {
			throw error(optionResponse.HttpCode || 500, optionResponse.Message || 'Failed to fetch option data');
		}

		const searchParams = {
			templateId: templateId,
			parentNodeId: nodeId
		};
		const nodesResponse = await searchAssessmentNodes(sessionId, searchParams);
	    const allNodes = nodesResponse?.Data?.AssessmentNodeRecords?.Items || [];
	    const childNodes = allNodes.filter(node => node.ParentNodeId === nodeId);

		return {
			pathData: pathResponse.Data?.Path || pathResponse.Data,
			optionData: optionResponse.Data?.Option,
			childNodes,
			sessionId,
			optionId,
			pathId,
			message: pathResponse.Message,
			title: 'Edit Assessment Path'
		};
	} catch (err) {
		console.error('Error loading path data for editing:', err);
		throw error(500, 'Failed to load path data');
	}
};
