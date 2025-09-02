import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchHealthSystems } from '../../../api/services/reancare/health.systems';
import { createSearchFilters } from '$lib/utils/search.utils';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:healthSystem');
    const searchFilters = createSearchFilters(event, {
        orderBy: "Name",
        order: "ascending",
        itemsPerPage: 10
    });
    
    console.log('Search Parameters:', searchFilters);
    const response = await searchHealthSystems(sessionId, searchFilters);

    const healthSystems = response?.Data?.HealthSystems || [];
	console.log("healthSystems==>",healthSystems);
    

    return {
        healthSystems,
        sessionId,
        message: response?.Message || 'Health Systems retrieved successfully',
        title:'Hospital Systems-Health Systems'
    };
		
};
