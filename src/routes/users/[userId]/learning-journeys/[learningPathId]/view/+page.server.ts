import { getLearningPathById } from '$routes/api/services/lms/learning.journeys';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const learningPathId = event.params.learningPathId;
	
	event.depends('app:learning-journey');
	
	const response = await getLearningPathById(sessionId, learningPathId);
	console.log("Learning Journey response:", JSON.stringify(response, null, 2));
	
	
	const learningJourney = response?.Data?.LearningPath || null;
	const id = response?.Data?.id;
	
	console.log("Extracted learning journey:", JSON.stringify(learningJourney, null, 2));

	if (!learningJourney) {
		console.error("Learning journey not found in response. Full response:", response);
	}

	return {
		location: `${id}/edit`,
		learningJourney: learningJourney || {},
		message: response?.Message || 'Learning journey retrieved successfully',
		title: 'Educational-Learning Journey View'
	};
};

