import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchGoals } from '../../../api/services/reancare/goals';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { createSearchFilters } from '$lib/utils/search.utils';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
    event.depends('app:goals');
    const searchFilters = createSearchFilters(event, {
        orderBy: 'Type',
        order: 'ascending',
        itemsPerPage: 10
    });
    
    console.log('Search Parameters:', searchFilters);
    const response = await searchGoals(sessionId, searchFilters);
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
