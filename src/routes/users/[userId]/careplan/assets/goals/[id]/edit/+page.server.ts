import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getGoalsById } from '$routes/api/services/careplan/assets/goals';
////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const goalsId = event.params.id;
	const tenantId = event.locals.sessionUser.tenantId;

	const response = await getGoalsById(sessionId, goalsId);

	const goals = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		goals,
		tenantId,
		message: response?.Message || 'goals retrieved successfully',
		title: 'Goals Edit'
	};
};

