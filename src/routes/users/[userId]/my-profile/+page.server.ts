import { redirect } from 'sveltekit-flash-message/server';
import { error, type RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import type { PageServerLoad } from './$types';
import { BACKEND_API_URL } from '$env/static/private';
import { getUserById, updateUser } from '../../../api/services/reancare/user';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const usreId = event.params.userId;
	const response = await getUserById(sessionId, usreId);

	if (response.Status === 'failure' || response.HttpCode !== 200) {
		throw error(response.HttpCode, response.Message);
	}
	const user = response.Data.user;
	const id = response.Data.user.id;
	const imageResourceId = user.Person.ImageResourceId;
	if (imageResourceId) {
		user.Person['ImageUrl'] =
			BACKEND_API_URL + `/file-resources/${imageResourceId}/download?disposition=inline`;
	} else {
		user.Person['ImageUrl'] = null;
	}
	return {
		location: `${id}/edit`,
		user,
		message: response.Message,
		title: 'My Profile'
	};
};

const updateUserSchema = zfd.formData({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	phone: z.string(),
	email: z.string().email({
		message: 'Invalid email address'
	}),
	countryCode: z.string().optional(),
	roleId: z.string().optional(),
	imageResourceId: z.string().uuid().optional()
});

export const actions = {
	updateProfileAction: async (event: RequestEvent) => {
		let response;
		const request = event.request;
		const userId = event.params.userId;
		const sessionId = event.cookies.get('sessionId');
		const data = await request.formData();
		const formData = Object.fromEntries(data);
		if (!formData.imageResourceId || formData.imageResourceId === 'undefined') {
			delete formData.imageResourceId;
		}
		console.log('formData', formData);

		type UserSchema = z.infer<typeof updateUserSchema>;

		let result: UserSchema = {};
		try {
			result = updateUserSchema.parse(formData);
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
		const defaultTimeZone = result.countryCode === '+1' ? '-05:00' : '+05:30';
		const currentTimeZone = result.countryCode === '+1' ? '-05:00' : '+05:30';
		const phone = result.countryCode + '-' + result.phone;
		try {
			response = await updateUser(
				sessionId,
				userId,
				result.firstName,
				result.lastName,
				phone,
				result.email,
				result.roleId,
				defaultTimeZone,
				currentTimeZone,
				result.imageResourceId
			);
		} catch (error) {
			throw redirect(
				303,
				`/users/${userId}/home`,
				errorMessage(error?.body?.message ? error?.body?.message : 'Error in updating profile'),
				event
			);
		}
		throw redirect(
			303,
			`/users/${userId}/home`,
			successMessage(response?.Message ? response?.Message : `Profile updated successfully!`),
			event
		);
	}
};
