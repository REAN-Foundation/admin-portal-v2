import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPriorityById } from '../../../../../api/services/reancare/priorities';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const priorityId = event.params.id;
    const response = await getPriorityById(sessionId, priorityId);
    if (response.Status === 'failure' || response.HttpCode !== 200) {
        throw error(response.HttpCode, response.Message);
    }
    const priority = response.Data.PriorityType;
    const id = response.Data.PriorityType.id;
    return {
        location: `${id}/edit`,
        priority,
        message: response.Message,
        title: 'Types-Priorities View'
    };
};