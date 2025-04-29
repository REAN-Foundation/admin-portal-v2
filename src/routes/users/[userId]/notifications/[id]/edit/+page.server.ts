import { error, type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import type { PageServerLoad } from './$types';
import { getNotificationById, updateNotification } from '../../../../../api/services/reancare/notifications';

/////////////////////////////////////////////////////////////////////////

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
			sessionId,
			location: `${id}/edit`,
			notification,
			message: response.Message
		};
	} catch (error) {
		console.error(`Error retriving notification: ${error.message}`);
	}
};

const updateNotificationSchema = zfd.formData({
	title: z.string().min(3).max(64),
	body: z.string().optional(),
	type: z.string().min(3).max(64),
	broadcastToAll: zfd.checkbox({ trueValue: 'true' }),
	imageUrl: z.string()
});

export const actions = {
	updateNotificationAction: async (event: RequestEvent) => {
		const request = event.request;
		const userId = event.params.userId;
		const notificationId = event.params.id;
		const sessionId = event.cookies.get('sessionId');
		const formData = Object.fromEntries(await request.formData());
		type NotificationSchema = z.infer<typeof updateNotificationSchema>;
		let result: NotificationSchema = {};
		try {
			result = updateNotificationSchema.parse(formData);
			console.log('result', result);
		} catch (err: any) {
			const { fieldErrors: errors } = err.flatten();
			console.log(errors);
			const { ...rest } = formData;
			return {
				data: rest,
				errors
			};
		}
		const response = await updateNotification(
			sessionId,
			notificationId,
			result.title,
			result.body,
			result.type,
			result.broadcastToAll,
			result.imageUrl
		);
		const id = response.Data.Notification.id;

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw redirect(303, `/users/${userId}/notifications`, errorMessage(response.Message), event);
		}
		throw redirect(
			303,
			`/users/${userId}/notifications/${id}/view`,
			successMessage(`Notification updated successfully!`),
			event
		);
	}
};
