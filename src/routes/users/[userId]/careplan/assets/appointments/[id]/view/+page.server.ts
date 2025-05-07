import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAppointmentById } from '$routes/api/services/careplan/assets/appointment';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	console.log('sessionId', sessionId);

	try {
		const appointmentId = event.params.id;
		console.log(appointmentId);
		const response = await getAppointmentById(sessionId, appointmentId);

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}
		const appointment = response.Data;
		console.log('appointment', appointment);
		const id = response.Data.id;
		return {
			location: `${id}/edit`,
			appointment,
			message: response.Message
		};
	} catch (error) {
		console.error(`Error retriving appointment ${error.message}`);
	}
};
