import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchHealthSystems } from '../../../api/services/reancare/health.systems';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:healthSystem');
    const response = await searchHealthSystems(sessionId, 
        {
            orderBy: "Name",
            order: "ascending",
            itemsPerPage: 10
        }
    );

    const healthSystems = response?.Data?.HealthSystems || [];
	console.log("healthSystems==>",healthSystems);
    

    return {
        healthSystems,
        sessionId,
        message: response?.Message || 'Health Systems retrieved successfully',
        title:'Hospital Systems-Health Systems'
    };
		
};
