import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { getCarePlanById } from '$routes/api/services/careplan/careplans';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const careplanId = event.params.careplanId;

	const response = await getCarePlanById(sessionId, careplanId);

	const carePlan = response?.Data;
	const id = response?.Data?.id;
	return {
		location: `${id}/edit`,
		carePlan,
		sessionId,
		message: response?.Message || 'Careplan retrieved successfully',
		title: 'Careplan View'
	};
};
