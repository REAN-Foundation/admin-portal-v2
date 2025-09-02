import { error, type ServerLoadEvent } from '@sveltejs/kit';
import { getOption, getAssessmentNodeById } from '$routes/api/services/reancare/assessments/assessment-nodes';
import { getAssessmentPaths } from '$routes/api/services/reancare/assessments/assessment-paths';
import type { PageServerLoad } from './$types';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const templateId = event.params.templateId;
	const nodeId = event.params.nodeId;
	const optionId = event.params.optionId;

	try {
		const nodeResponse = await getAssessmentNodeById(sessionId, templateId, nodeId);
		if (nodeResponse.Status === 'failure' || nodeResponse.HttpCode !== 200) {
			console.warn('Failed to fetch node data:', nodeResponse.Message);
		}
		const optionResponse = await getOption(sessionId, templateId, nodeId, optionId);
		if (optionResponse.Status === 'failure' || optionResponse.HttpCode !== 200) {
			throw error(optionResponse.HttpCode || 500, optionResponse.Message || 'Failed to fetch option data');
		}
		const pathsResponse = await getAssessmentPaths(sessionId, templateId, nodeId, optionId);
		const paths = pathsResponse.Status === 'success' ? (pathsResponse.Data?.Paths || []) : [];

		return {
			nodeData: nodeResponse.Status === 'success' ? nodeResponse.Data?.AssessmentNode : null,
			optionData: optionResponse.Data?.Option,
			paths,
			sessionId,
			message: pathsResponse.Message,
			title: 'Assessment Paths'
		};
	} catch (err) {
		console.error('Error loading paths data:', err);
		throw error(500, 'Failed to load paths data');
	}
};
