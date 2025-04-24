import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchGoals } from '../../../api/services/rean-care/goals';
import type { ServerLoadEvent } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    event.depends('app:goals');
    const response = await searchGoals(sessionId,{
        orderBy: 'Type',
        order : 'ascending'
    });
    if (response.Status === 'failure' || response.HttpCode !== 200) {
        throw error(response.HttpCode, response.Message);
    }
    const goalTypes = response.Data.GoalTypes;
    return {
        goalTypes,
        sessionId,
        message: response.Message,
        title: 'Types-Goals'
    };
};
