import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getNotificationById } from '../../../../../api/services/reancare/notifications';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');

	try {
		const notificationId = event.params.id;
		const response = await getNotificationById(sessionId, notificationId);

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}
		const notification = response.Data.Notification;
		const id = response.Data.Notification.id;
		return {
			location: `${id}/edit`,
			notification,
			message: response.Message
		};
	} catch (error) {
		console.error(`Error retriving notification: ${error.message}`);
	}
};
