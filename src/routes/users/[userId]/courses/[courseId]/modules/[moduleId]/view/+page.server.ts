import { getModuleById } from '$routes/api/services/reancare/educational/modules';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { BACKEND_API_URL } from '$env/static/private';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    const moduleId = event.params.moduleId;
    const response = await getModuleById(sessionId, moduleId);

    const module = response?.Data?.CourseModule;
    
    if (!module) {
        return {
            module: null,
            message: response?.Message || 'Module not found',
            title: 'Educational-Learning Journey-Courses-Modules View'
        };
    }

    const imageResourceId = module?.ImageResourceId || module?.ImageUrl;
    const id = module?.id || response?.Data?.Module?.id;

    if (imageResourceId) {
        module['ImageResourceUrl'] =
            BACKEND_API_URL + `/file-resources/${imageResourceId}/download?disposition=inline`;
    } else {
        module['ImageResourceUrl'] = null;
    }

    return {
        location: `${id}/edit`,
        module,
        message: response?.Message || 'Module retrieved successfully',
        title:'Educational-Learning Journey-Courses-Modules View'
    };
};

