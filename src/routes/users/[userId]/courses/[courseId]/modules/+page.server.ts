import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchModules } from '$routes/api/services/reancare/educational/modules';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:module');
    const searchFilters = createSearchFilters(event, {
        orderBy: "Name",
        order: "ascending",
        itemsPerPage: 10
    });
    
    console.log('Search Parameters:', searchFilters);
    const response = await searchModules(sessionId, searchFilters);

    const modules = response?.Data?.CourseModules || [];
	console.log("modules==>",modules);
    

    return {
        modules,
        sessionId,
        message: response?.Message || 'Modules retrieved successfully',
        title:'Educational-Learning Journey-Courses-Modules'
    };
		
};

