import { getCourseById } from '$routes/api/services/reancare/educational/course';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    const courseId = event.params.courseId;
    const response = await getCourseById(sessionId, courseId);

    const course = response?.Data?.Course;
    const id = response?.Data?.Course?.id;
    return {
        location: `${id}/edit`,
        course,
        message: response?.Message || 'Course retrieved successfully',
        title:'Educational-Learning Journey-Courses View'
    };
};

