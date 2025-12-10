import { getLearningPathById } from '$routes/api/services/lms/learning.journeys';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchCourses } from '$routes/api/services/lms/courses';

///////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const learningPathId = event.params.learningPathId;
	const tenantId = event.locals.sessionUser.tenantId;
	const response = await getLearningPathById(sessionId, learningPathId);

	const learningJourney = response?.Data?.LearningPath || null;
	const id = response?.Data?.id;

	event.depends('app:course');
	
	const searchFilters = createSearchFilters(event, {
		order: "ascending",
		orderBy: "Name",
		itemsPerPage: 1000,
		pageIndex: 0
	});
	
	const coursesResponse = await searchCourses(sessionId, searchFilters);
	const courseData = coursesResponse?.Data?.CourseRecords || {};
	const courses = courseData.Items || [];

	return {
		tenantId,
		location: `${id}/edit`,
		learningJourney,
		courses,
		message: response?.Message || 'Learning journey retrieved successfully',
		title: 'Educational-Learning Journey Edit'
	};
};

