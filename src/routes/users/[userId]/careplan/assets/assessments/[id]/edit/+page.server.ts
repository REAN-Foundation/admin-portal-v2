import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAssessmentById } from '$routes/api/services/careplan/assets/assessments';
import { searchAssessmentTemplates } from '$routes/api/services/reancare/assessments/assessment-templates';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const assessmentId = event.params.id;
	const tenantId = event.locals.sessionUser.tenantId;
	const response = await getAssessmentById(sessionId, assessmentId);

	const assessment = response?.Data;
	const id = response?.Data?.id;
	const templatesResponse = await searchAssessmentTemplates(sessionId, {
			orderBy: 'Title',
			order: 'ascending'
		});
		const assessmentTemplates = templatesResponse?.Data?.AssessmentTemplateRecords?.Items ?? [];

	return {
		location: `${id}/edit`,
		assessment,
		assessmentTemplates,
		tenantId,
		message: response?.Message || 'assessment retrieved successfully',
		title: 'Assessment Edit'
	};
};

