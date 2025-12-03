import { getLearningPathById } from '$routes/api/services/lms/learning.journeys';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';

///////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const learningPathId = event.params.learningPathId;
	const tenantId = event.locals.sessionUser.tenantId;
	const response = await getLearningPathById(sessionId, learningPathId);

	const learningJourney = response?.Data?.LearningPath || null;
	const id = response?.Data?.id;

	return {
		tenantId,
		location: `${id}/edit`,
		learningJourney,
		message: response?.Message || 'Learning journey retrieved successfully',
		title: 'Educational-Learning Journey Edit'
	};
};

