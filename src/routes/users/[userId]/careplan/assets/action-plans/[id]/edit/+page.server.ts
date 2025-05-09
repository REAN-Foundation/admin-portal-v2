import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getActionPlanById } from '$routes/api/services/careplan/assets/action-plan';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const actionPlanId = event.params.id;
	const response = await getActionPlanById(sessionId, actionPlanId);

	const actionPlan = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		actionPlan,
		message: response?.Message || 'Action Plan retrieved successfully',
		title: 'Action Plan Edit'
	};
};
