import { getContentById } from '$routes/api/services/reancare/educational/content';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { BACKEND_API_URL } from '$env/static/private';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    const contentId = event.params.contentId;
    const response = await getContentById(sessionId, contentId);
    
    const content = response?.Data?.CourseContent || response?.Data?.Content || response?.Data?.Contents;
    
    if (!content) {
        return {
            content: null,
            message: response?.Message || 'Content not found',
            title: 'Educational-Learning Journey-Courses-Modules-Contents View'
        };
    }

    const imageResourceId = content?.ImageResourceId || content?.ImageUrl;
    const id = content?.id;

    if (imageResourceId) {
        content['ImageResourceUrl'] =
            BACKEND_API_URL + `/file-resources/${imageResourceId}/download?disposition=inline`;
    } else {
        content['ImageResourceUrl'] = null;
    }

    return {
        location: `${id}/edit`,
        content,
        message: response?.Message || 'Content retrieved successfully',
        title:'Educational-Learning Journey-Courses-Modules-Contents View'
    };
};

