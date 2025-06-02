import type { PageServerLoad } from './$types';
import type { RequestEvent } from '@sveltejs/kit';
import {
	getCarePlanActivityById
} from '$routes/api/services/careplan/scheduling';
import { getTimeSlots } from '$routes/api/services/careplan/types';
import { getAssetsType } from '$routes/api/services/careplan/assets/asset';


/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');

	try {
		const careplanActivityId = event.params.activityid;

		const careplanActivitiy_ = await getCarePlanActivityById(sessionId, careplanActivityId);
		const careplanActivitiy = careplanActivitiy_.Data;

		const assetTypes = await getAssetsType(sessionId);
		const timeslot = await getTimeSlots();
		return {
			careplanActivitiy,
			assetTypes,
			timeslot,
			sessionId
		};
	} catch (error) {
		console.error(`Error retriving careplan activity data : ${error.message}`);
	}
};