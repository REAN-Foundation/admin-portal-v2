import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchContents } from '$routes/api/services/lms/content';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:content');
	const moduleId = event.params.moduleId;
	
    const searchFilters = createSearchFilters(event, {
        orderBy: "Title",
        order: "ascending",
        itemsPerPage: 10,
        courseModuleId: moduleId
    });
    
    const response = await searchContents(sessionId, searchFilters);
    const contentsData = response?.Data?.CourseContentRecords || {
        Items: [],
        TotalCount: 0,
        RetrievedCount: 0,
        PageIndex: 0,
        ItemsPerPage: 0
    };

    return {
        contents: contentsData,
        sessionId,
        message: response?.Message || 'Contents retrieved successfully',
        title:'Educational-Learning Journey-Courses-Modules-Contents'
    };
		
};

