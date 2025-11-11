import { getCourseById } from '$routes/api/services/reancare/educational/course';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { BACKEND_API_URL } from '$env/static/private';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    const courseId = event.params.courseId;
    const response = await getCourseById(sessionId, courseId);

    const course = response?.Data?.Course;
    const imageResourceId = course?.ImageResourceId || course?.ImageUrl;
    const id = response?.Data?.Course?.id;

    if (imageResourceId) {
        course['ImageResourceUrl'] =
            BACKEND_API_URL + `/file-resources/${imageResourceId}/download?disposition=inline`;
    } else {
        course['ImageResourceUrl'] = null;
    }

    return {
        location: `${id}/edit`,
        course,
        message: response?.Message || 'Course retrieved successfully',
        title:'Educational-Learning Journey-Courses View'
    };
};

