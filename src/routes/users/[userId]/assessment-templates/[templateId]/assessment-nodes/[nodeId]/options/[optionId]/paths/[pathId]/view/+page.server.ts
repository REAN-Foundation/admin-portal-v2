import { error, type ServerLoadEvent } from '@sveltejs/kit';
import { getOption } from '$routes/api/services/reancare/assessments/assessment-nodes';
import { getAssessmentPathById } from '$routes/api/services/reancare/assessments/assessment-paths';
import type { PageServerLoad } from './$types';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const templateId = event.params.templateId;
	const nodeId = event.params.nodeId;
	const optionId = event.params.optionId;
	const pathId = event.params.pathId;

	try {
		const pathResponse = await getAssessmentPathById(sessionId, templateId, nodeId, pathId);
		if (pathResponse.Status === 'failure' || pathResponse.HttpCode !== 200) {
			throw error(pathResponse.HttpCode || 500, pathResponse.Message || 'Failed to fetch path data');
		}
		const optionResponse = await getOption(sessionId, templateId, nodeId, optionId);
		if (optionResponse.Status === 'failure' || optionResponse.HttpCode !== 200) {
			throw error(optionResponse.HttpCode || 500, optionResponse.Message || 'Failed to fetch option data');
		}

		return {
			pathData: pathResponse.Data?.NodePath,
			optionData: optionResponse.Data?.Option,
			optionId,
			pathId,
			sessionId,
			message: pathResponse.Message,
			title: 'View Assessment Path'
		};
	} catch (err) {
		console.error('Error loading path data:', err);
		throw error(500, 'Failed to load path data');
	}
};
