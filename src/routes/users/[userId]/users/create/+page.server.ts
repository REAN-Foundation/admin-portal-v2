import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent, ServerLoadEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { createUser, getUserRoleList } from '../../../../api/services/reancare/user';
/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {

  const userRole = event.locals.sessionUser.roleName;

  if (!userRole) {
    throw error(403, 'Invalid user role');
  }

  const userRoles = await getUserRoleList(userRole);
	return {
		UserRoles: userRoles,
		title:'Administration-Users Create'
	};

};

const createUserSchema = zfd.formData({
    firstName: z.string().min(1).max(36),
    lastName: z.string().min(1).max(36),
    phone: z.string(),
    email: z.string().email(
      { 
        message: "Invalid email address" 
      }
    ),
    role: z.enum(
      ['System user', 'Tenant admin', 'Tenant user'], 
      { 
        message: "Invalid role type"
      }
    ),
    password: z.string().regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/, 
      {
        message: 'The password should be at least 8 characters long and must contain at least 1 capital letter, 1 small letter, 1 digit, and 1 special character.'
      }
    ).min(8, 
      {
        message: "Password must be 8 characters"
      }
    ),
    selectedUserRoleId: z.string(),
    countryCode:z.string()

  });

export const actions = {
	createUserAction: async (event: RequestEvent) => {
    const tenantId = event.locals?.sessionUser?.tenantId;
		const request = event.request;
		const userId = event.params.userId;
		const sessionId = event.cookies.get('sessionId');
		const data = await request.formData();
		const formData = Object.fromEntries(data);
		type UserSchema = z.infer<typeof createUserSchema>;

		let result: UserSchema = {};
		try {
			result = createUserSchema.parse(formData);
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
		let response;
		try {
			response = await createUser(
				sessionId,
				tenantId,
				result.firstName,
				result.lastName,
				phone,
				result.email,
				result.role,
				result.selectedUserRoleId,
				result.password,
				defaultTimeZone,
				currentTimeZone
			);
		}
		catch (err) {
			console.error(`Error creating user : ${err.body.message}`);
			throw redirect(303, `/users/${userId}/users`, errorMessage(err.body.message), event);
		}
		const id = response.Data.User.id;
		throw redirect(
			303,
			`/users/${userId}/users/${id}/view`,
			successMessage(`User created successfully!`),
			event
		);
	}
};
