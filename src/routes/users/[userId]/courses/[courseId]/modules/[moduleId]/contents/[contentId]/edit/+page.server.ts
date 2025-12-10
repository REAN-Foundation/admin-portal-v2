import { getContentById } from '$routes/api/services/lms/course.contents';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { BACKEND_API_URL } from '$env/static/private';

///////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const contentId = event.params.contentId;
    const response = await getContentById(sessionId, contentId);
    
    const content = response?.Data?.CourseContent || response?.Data?.Content || response?.Data?.Contents;
    const imageResourceId = content?.ImageResourceId || content?.ImageUrl;
    const id = content?.id || response?.Data?.CourseContent?.id || response?.Data?.Content?.id;

    if (imageResourceId) {
        content['ImageUrl'] =
            BACKEND_API_URL + `/file-resources/${imageResourceId}/download?disposition=inline`;
        content['ImageResourceId'] = imageResourceId;
    } else {
        content['ImageUrl'] = null;
        content['ImageResourceId'] = null;
    }

    return {
        location: `${id}/edit`,
        content,
        message: response?.Message || 'Content retrieved successfully',
        title: 'Educational-Learning Journey-Courses-Modules-Contents Edit'
    };
};

