import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchCourses } from '$routes/api/services/lms/course';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:course');
	
	const searchFilters = createSearchFilters(event, {
		order: "ascending",
		orderBy: "Name",
		itemsPerPage: 1000,
		pageIndex: 0
	});
	
	const response = await searchCourses(sessionId, searchFilters);
	const courseData = response?.Data?.CourseRecords || {};
	const courses = courseData.Items || [];

	return {
		courses,
		sessionId,
		message: response?.Message || 'Courses retrieved successfully',
		title: 'Learning Journey Create'
	};
};

