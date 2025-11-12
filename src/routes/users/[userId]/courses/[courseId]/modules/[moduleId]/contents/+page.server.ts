import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchContents } from '$routes/api/services/reancare/educational/content';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:content');
	const moduleId = event.params.moduleId;
	
    const searchFilters = createSearchFilters(event, {
        orderBy: "Title",
        order: "ascending",
        itemsPerPage: 10,
        moduleId: moduleId
    });
    
    console.log('Search Parameters:', searchFilters);
    const response = await searchContents(sessionId, searchFilters);
    
    // Handle both CourseContents and Contents response structures
    const contentsData = response?.Data?.CourseContents || response?.Data?.Contents;
    console.log("contents==>", contentsData);

    return {
        contents: contentsData || { Items: [], TotalCount: 0 },
        sessionId,
        message: response?.Message || 'Contents retrieved successfully',
        title:'Educational-Learning Journey-Courses-Modules-Contents'
    };
		
};

