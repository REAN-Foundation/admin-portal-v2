import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

////////////////////////////////////////////////////////////////////////////

// export const load: PageServerLoad = async (event: RequestEvent) => {
// 	const sessionId = event.cookies.get('sessionId');

// 	try {
// 		const response = await searchNotifications(sessionId);
// 		if (response.Status === 'failure' || response.HttpCode !== 200) {
// 			throw error(response.HttpCode, response.Message);
// 		}
// 		const notification = response.Data.NotificationRecords;
// 		return {
// 			notification,
// 			sessionId,
// 			message: response.Message
// 		};
// 	} catch (error) {
// 		console.error(`Error retriving notification: ${error.message}`);
// 	}
// };

import { redirect } from 'sveltekit-flash-message/server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { sendNotification } from '../../../api/services/reancare/notifications';

/////////////////////////////////////////////////////////////////////////

const createNotificationSchema = zfd.formData({
	topic: z.string(),
	title: z.string().min(2).max(50),
	body: z.string().min(2).max(150),
	type: z.string().optional(),
	url: z.string().optional()
});

export const actions = {
	createNotificationAction: async (event: RequestEvent) => {
		const request = event.request;
		const userId = event.params.userId;
		const sessionId = event.cookies.get('sessionId');
		const formData = Object.fromEntries(await request.formData());
		type NotificationSchema = z.infer<typeof createNotificationSchema>;
		let result: NotificationSchema = {};
		console.log('result', result);
		try {
			result = createNotificationSchema.parse(formData);
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
		const response = await sendNotification(
			sessionId,
			result.topic,
			result.title,
			result.body,
			result.type,
			result.url
		);

		if (response.Status === 'failure' || response.HttpCode !== 201) {
			throw redirect(303, `/users/${userId}/notifications`, errorMessage(response.Message), event);
		}
		throw redirect(
			303,
			`/users/${userId}/notifications`,
			successMessage(`Notification sent successfully!`),
			event
		);
	} 
};
