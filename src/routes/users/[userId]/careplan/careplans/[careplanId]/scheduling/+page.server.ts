import type { PageServerLoad } from './$types';
import type {  ServerLoadEvent } from '@sveltejs/kit';
import { getCarePlanById, searchCareplanCategories } from '$routes/api/services/careplan/careplans';
import {
	searchCarePlanActivities
} from '$routes/api/services/careplan/scheduling';
import { getAssetsType } from '$routes/api/services/careplan/assets/asset';
import { getTimeSlots } from '$routes/api/services/careplan/types';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {

	const sessionId = event.cookies.get('sessionId');
	event.depends('app:careplan-careplans-scheduling');

	try {
		const careplanId = event.params.careplanId;
		const searchParams = {
			careplanId: careplanId
		};
		const careplan = await getCarePlanById(sessionId, careplanId);
		const response = await searchCarePlanActivities(sessionId, searchParams);
		const careplanActivities = response.Data.Items;
		const assetTypes = await getAssetsType(sessionId);
		const timeslot = await getTimeSlots();

		const _careplanCategories = await searchCareplanCategories(sessionId);
		const careplanCategories = _careplanCategories.Data.Items;
	
		return {
			careplanActivities,
			assetTypes,
			careplanCategories,
			careplan,
			timeslot,
			sessionId
		};
	} catch (error) {
		console.error(`Error retriving data: ${error.message}`);
	}
};