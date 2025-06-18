import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getReminderById } from '$routes/api/services/careplan/assets/reminders';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const reminderId = event.params.id;
	const tenantId = event.locals.sessionUser.tenantId;

	const response = await getReminderById(sessionId, reminderId);

	const reminder = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		reminder,
		tenantId,
		message: response?.Message || 'Reminder retrieved successfully',
		title: 'Reminder Edit'
	};
};

