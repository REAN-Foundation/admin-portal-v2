import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchCourses } from '$routes/api/services/reancare/educational/course';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:course');
	
    const searchFilters = createSearchFilters(event, {
        // orderBy: "Name",
        order: "ascending",
        itemsPerPage: 10
    });
    
    const response = await searchCourses(sessionId,searchFilters);
    console.log("Courses response:", response);
    const courses = response?.Data || [];

    return {
        courses,
        sessionId,
        message: response?.Message || 'Courses retrieved successfully',
        title:'Educational-Learning Journey-Courses'
    };
		
};

