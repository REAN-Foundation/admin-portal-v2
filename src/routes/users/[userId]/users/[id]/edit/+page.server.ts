import { redirect } from 'sveltekit-flash-message/server';
import { error, type RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import type { PageServerLoad } from './$types';
import { getUserById, updateUser } from '../../../../../api/services/reancare/user';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const usreId = event.params.id;
	const response = await getUserById(sessionId, usreId);

	if (response.Status === 'failure' || response.HttpCode !== 200) {
		throw error(response.HttpCode, response.Message);
	}
	const user = response.Data.user;
	const id = response.Data.user.id;
	return {
		location: `${id}/edit`,
		user,
		message: response.Message,
		title:'Administration-Users Edit'
	};
	
};

const updateUserSchema = zfd.formData({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
    phone: z.string(),
    email: z.string().email(
      { 
        message: "Invalid email address" 
      }
    ),
	role: z.string().optional(),
	countryCode:z.string().optional(),
	selectedUserRoleId:z.string().optional(),
	// imageResourceId: z.string().optional(),
});

export const actions = {
	updateUserAction: async (event: RequestEvent) => {
        let response;
		const request = event.request;
		const userId = event.params.userId;
		const id = event.params.id;
		const sessionId = event.cookies.get('sessionId');
		const data = await request.formData();
		const formData = Object.fromEntries(data);

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
                id,
                result.firstName,
                result.lastName,
                phone,
                result.email,
                result.selectedUserRoleId,
                defaultTimeZone,
                currentTimeZone
                // result.role,
                // result.imageResourceId
            );
        } catch (error) {
            throw redirect(303, `/users/${userId}/users`, errorMessage(error?.body?.message ? error?.body?.message: "Error in updating"), event);
        }
        throw redirect(
            303,
            `/users/${userId}/users/${id}/view`,
            successMessage(response?.Message ? response?.Message : `User updated successfully!`),
            event
        );
		// const id = response.Data.user.id;
	}
};
