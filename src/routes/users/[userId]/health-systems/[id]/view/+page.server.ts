import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getHealthSystemById } from '../../../../../api/services/reancare/health.systems';
import type { ServerLoadEvent } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    const healthSystemId = event.params.id;
    const response = await getHealthSystemById(sessionId, healthSystemId);

    const healthSystem = response?.Data?.HealthSystem;
    const id = response?.Data?.HealthSystem?.id;
    return {
        location: `${id}/edit`,
        healthSystem,
        message: response?.Message || 'Health System retrieved successfully',
        title:'Hospital Systems-Health Systems View'
    };
};
