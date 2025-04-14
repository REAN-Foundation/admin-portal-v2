import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { getHealthSystemById } from '../../../../../api/services/rean-care/health.systems';

///////////////////////////////////////////////////////////////////////////////

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
        title: 'Hospital Systems-Health Systems Edit'
    };
};
