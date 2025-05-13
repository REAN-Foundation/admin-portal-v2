import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAssessmentById } from '$routes/api/services/careplan/assets/assessments';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const assessmentId = event.params.id;
	const response = await getAssessmentById(sessionId, assessmentId);

	const assessment = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		assessment,
		message: response?.Message || 'assessment retrieved successfully',
		title: 'Assessment Edit'
	};
};

