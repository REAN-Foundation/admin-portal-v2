import { getCourseById } from '$routes/api/services/lms/courses';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { BACKEND_API_URL } from '$env/static/private';

///////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const courseId = event.params.courseId;
    const tenantId = event.locals.sessionUser.tenantId;
    const response = await getCourseById(sessionId, courseId);

    const course = response?.Data;
    const imageResourceId = course?.ImageResourceId || course?.ImageUrl;
    const id = response?.Data?.id;

    if (imageResourceId) {
        course['ImageUrl'] =
            BACKEND_API_URL + `/file-resources/${imageResourceId}/download?disposition=inline`;
        course['ImageResourceId'] = imageResourceId;
    } else {
        course['ImageUrl'] = null;
        course['ImageResourceId'] = null;
    }

    return {
        tenantId,
        location: `${id}/edit`,
        course,
        message: response?.Message || 'Course retrieved successfully',
        title: 'Educational-Learning Journey-Courses Edit'
    };
};

