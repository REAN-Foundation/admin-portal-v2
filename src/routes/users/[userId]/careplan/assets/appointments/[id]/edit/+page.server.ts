import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAppointmentById } from '$routes/api/services/careplan/assets/appointment';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const appointmentId = event.params.id;
	const tenantId = event.locals.sessionUser.tenantId;
	const response = await getAppointmentById(sessionId, appointmentId);

	const appointment = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		appointment,
		tenantId,
		message: response?.Message || 'Appointment retrieved successfully',
		title: 'Appointment Edit'
	};
};
