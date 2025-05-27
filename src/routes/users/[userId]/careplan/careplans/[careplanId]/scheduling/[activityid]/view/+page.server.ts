import type { RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { redirect } from 'sveltekit-flash-message/server';
import { errorMessage } from '$lib/utils/message.utils';
import { getCarePlanActivityById } from '$routes/api/services/careplan/scheduling';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');

	try {
		const careplanId = event.params.careplanId;
		const careplanActivityId = event.params.activityid;
		const userId = event.params.userId;
		const response = await getCarePlanActivityById(sessionId, careplanActivityId);
		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw redirect(
				303,
				`/users/${userId}/careplan/careplans/${careplanId}/scheduling/${careplanActivityId}/view`,
				errorMessage(response.Message),
				event
			);
		}
		const careplanActivity = response.Data;

		const id = response.Data.id;
		return {
			location: `${id}/edit`,
			careplanActivity,
			message: response.Message
		};
	} catch (error) {
		console.error(`Error retriving care plan activity: ${error.message}`);
	}
};
