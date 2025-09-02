import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { getCarePlanById, searchCareplanCategories } from '$routes/api/services/careplan/careplans';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const careplanId = event.params.careplanId;
	const tenantId = event.locals.sessionUser.tenantId;
	const response = await getCarePlanById(sessionId, careplanId);
	const careplanCategories_ = await searchCareplanCategories(sessionId);
	
	const careplanCategories = careplanCategories_.Data.Items;

	const carePlan = response?.Data;
	const id = response?.Data?.id;
	return {
		location: `${id}/edit`,
		carePlan,
		tenantId,
		careplanCategories,
		message: response?.Message || 'Care Plan retrieved successfully',
		title: 'Care Plan View'
	};
};
