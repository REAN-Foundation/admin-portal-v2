import { getLearningPathById } from '$routes/api/services/lms/learning.journeys';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const learningPathId = event.params.learningPathId;
	
	event.depends('app:learning-journey');
	event.depends('app:course');
	
	const response = await getLearningPathById(sessionId, learningPathId);	
	const learningJourney = response?.Data?.LearningPath || null;
	const id = learningJourney?.id;
	
	let courses = learningJourney?.Courses || [];
	
	if (!Array.isArray(courses)) {
		courses = [];
	}

	return {
		location: `${id}/edit`,
		learningJourney: learningJourney || {},
		courses,
		message: response?.Message || 'Learning journey retrieved successfully',
		title: 'Educational-Learning Journey View'
	};
};

