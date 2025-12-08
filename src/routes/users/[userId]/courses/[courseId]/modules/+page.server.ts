import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchModules } from '$routes/api/services/lms/course.modules';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:module');
	const courseId = event.params.courseId;
	
    const searchFilters = createSearchFilters(event, {
        orderBy: "Name",
        order: "ascending",
        itemsPerPage: 100,
        courseId: courseId
    });
    
    console.log('Search Parameters:', searchFilters);
    console.log('CourseId from params:', courseId);
    const response = await searchModules(sessionId, searchFilters);

    const modules = response?.Data?.CourseModuleRecords || {
        Items: [],
        TotalCount: 0,
        RetrievedCount: 0,
        PageIndex: 0,
        ItemsPerPage: 0
    };
	console.log("modules==>",modules);
    

    return {
        modules,
        sessionId,
        message: response?.Message || 'Modules retrieved successfully',
        title:'Educational-Learning Journey-Courses-Modules'
    };
		
};

