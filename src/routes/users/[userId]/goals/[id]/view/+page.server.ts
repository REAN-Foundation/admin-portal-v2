import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getGoalById } from '../../../../../api/services/rean-care/goals';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
    const goalId = event.params.id;
    const response = await getGoalById(sessionId, goalId);

    if (response.Status === 'failure' || response.HttpCode !== 200) {
        throw error(response.HttpCode, response.Message);
    }
    const goal = response.Data.GoalType;
    const id = response.Data.GoalType.id;
    return {
        location: `${id}/edit`,
        goal,
        message: response.Message,
        title: 'Types-Goals View'
    };
};
