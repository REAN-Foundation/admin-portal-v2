import type { ServerLoadEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { getAssessmentTemplateById } from '$routes/api/services/reancare/assessments/assessment-templates';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const templateId = event.params.templateId;

	if (!sessionId) {
		throw error(401, 'Unauthorized');
	}

	try {
		const templateResponse = await getAssessmentTemplateById(sessionId, templateId);
		
		if (templateResponse.Status === 'failure' || templateResponse.HttpCode !== 200) {
			throw error(templateResponse.HttpCode, templateResponse.Message);
		}

		const templateDetails = templateResponse.Data.AssessmentTemplate;

		return {
			templateDetails,
			sessionId,
			message: templateResponse.Message,
			title: 'Assessment Paths'
		};
	} catch (err) {
		console.error('Error loading assessment template:', err);
		throw error(500, 'Failed to load assessment template');
	}
}; 