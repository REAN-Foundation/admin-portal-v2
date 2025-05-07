import { getActionPlanById } from '../../../../../../../api/services/careplan/assets/action-plan';
import type { PageServerLoad } from './$types';
import { error, type RequestEvent } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	try {
		const actionPlanId = event.params.id;
		const response = await getActionPlanById(sessionId, actionPlanId);

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}
		const actionPlan = response.Data;
		console.log('actionPlan', actionPlan);
		const id = response.Data.id;
		return {
			location: `${id}/edit`,
			actionPlan,
			message: response.Message
		};
	} catch (error) {
		console.error(`Error retriving action plan: ${error.message}`);
	}
};
