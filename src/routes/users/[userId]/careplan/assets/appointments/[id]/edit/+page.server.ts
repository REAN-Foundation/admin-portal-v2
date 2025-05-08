import { error, type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import {
	getAppointmentById,
	updateAppointment
} from '$routes/api/services/careplan/assets/appointment';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	console.log('sessionId', sessionId);
	try {
		const appointmentId = event.params.id;
		const response = await getAppointmentById(sessionId, appointmentId);

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}
		const appointment = response.Data;
		return {
			appointment
		};
	} catch (error) {
		console.error(`Error retriving appointment: ${error.message}`);
	}
};

const updateAppointmentSchema = zfd.formData({
	name: z.string().max(128),
	description: z.string().optional(),
	appointmentType: z.string().optional(),
	tags: z.array(z.string()).optional(),
	version: z.string().optional()
});

export const actions = {
	updateAppointmentAction: async (event: RequestEvent) => {
		const request = event.request;
		const userId = event.params.userId;
		const appointmentId = event.params.id;
		const sessionId = event.cookies.get('sessionId');
		const data = await request.formData();
		const formData = Object.fromEntries(data);
		const tags = data.has('tags') ? data.getAll('tags') : [];
		const formDataValue = { ...formData, tags: tags };

		type AppointmentSchema = z.infer<typeof updateAppointmentSchema>;

		let result: AppointmentSchema = {};
		try {
			result = updateAppointmentSchema.parse(formDataValue);
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

		const response = await updateAppointment(
			sessionId,
			appointmentId,
			result.name,
			result.description,
			result.appointmentType,
			result.tags,
			result.version
		);
		console.log(response);
		const id = response.Data.id;
		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw redirect(303, `/users/${userId}/careplan/assets`, errorMessage(response.Message), event);
		}
		throw redirect(
			303,
			`/users/${userId}/careplan/assets/appointments/${id}/view`,
			successMessage(`Appointment updated successfully!`),
			event
		);
	}
};
