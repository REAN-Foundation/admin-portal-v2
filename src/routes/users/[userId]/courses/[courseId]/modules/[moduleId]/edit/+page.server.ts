import { getModuleById } from '$routes/api/services/lms/modules';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { BACKEND_API_URL } from '$env/static/private';

///////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const moduleId = event.params.moduleId;
    const response = await getModuleById(sessionId, moduleId);

    const module = response?.Data;
    
    if (!module) {
        return {
            module: null,
            message: response?.Message || 'Module not found',
            title: 'Educational-Learning Journey-Courses-Modules Edit'
        };
    }

    const imageResourceId = module?.ImageResourceId;
    const imageUrl = module?.ImageUrl;
    const id = module?.id;

    // Check if ImageUrl is a UUID (resource ID) or already a full URL
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isImageUrlUuid = imageUrl && uuidRegex.test(imageUrl);

    if (imageResourceId || isImageUrlUuid) {
        const resourceId = imageResourceId || imageUrl;
        module['ImageUrl'] =
            BACKEND_API_URL + `/file-resources/${resourceId}/download?disposition=inline`;
        module['ImageResourceId'] = resourceId;
    } else if (imageUrl) {
        // ImageUrl is already a full URL, use it as-is
        module['ImageUrl'] = imageUrl;
        module['ImageResourceId'] = null;
    } else {
        module['ImageUrl'] = null;
        module['ImageResourceId'] = null;
    }

    return {
        location: `${id}/edit`,
        module,
        message: response?.Message || 'Module retrieved successfully',
        title: 'Educational-Learning Journey-Courses-Modules Edit'
    };
};

