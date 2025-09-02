import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from '../../../$types';
import { getReminderById } from '$routes/api/services/careplan/assets/reminders';


////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const remindersId = event.params.id;
	const response = await getReminderById(sessionId, remindersId);

	const reminder = response?.Data;
	const id = reminder?.id;

	return {
		location: `${id}/edit`,
		reminder,
		message: response?.Message || 'Reminders retrieved successfully',
		title: 'Reminder Edit'
	};
};

