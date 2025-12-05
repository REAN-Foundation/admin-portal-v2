import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchLearningJourneys } from '$routes/api/services/lms/learning.journeys';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:learning-journey');
	
    const searchFilters = createSearchFilters(event, {
        order: "ascending",
        itemsPerPage: 10
    });
    
    const response = await searchLearningJourneys(sessionId, searchFilters);
    
    const learningJourneys = response?.Data?.LearningPathRecords || {
        TotalCount: 0,
        RetrievedCount: 0,
        PageIndex: 0,
        ItemsPerPage: 10,
        Items: []
    };    

    return {
        learningJourneys,
        sessionId,
        message: response?.Message || 'Learning journeys retrieved successfully',
        title:'Educational-Learning Journey'
    };
		
};

