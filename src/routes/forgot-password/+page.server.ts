// import { fail } from '@sveltejs/kit';
// import z from 'zod';
// import type { Actions } from '@sveltejs/kit';

// import { redirect } from 'sveltekit-flash-message/server';
// import type { PersonRole } from '$lib/types/domain.models';
// import { resetPassword } from '../api/services/user';
// import { getPersonRolesForEmail, getPersonRolesForPhone } from '../api/services/person';

// /////////////////////////////////////////////////////

// export const actions: Actions = {
// 	passwordReset: async (event) => {
// 		const resetForm = Object.fromEntries(await event.request.formData());
//         console.log(resetForm);
//         console.log("IN RESET FORM");
        
// 		const resetData = resetPasswordSchema.safeParse(resetForm);

// 		let availableRoles: PersonRole[] = [];
// 		let filteredRoles: PersonRole[] = [];
// 		let loginRoleId = null;

// 		let phone = '';

// 		if (resetData.data?.phone && resetForm.CountryCode) {
// 			phone = resetForm.CountryCode + '-' + resetData.data?.phone;
//             console.log("phone==>", phone);
            
// 			var res_ = (availableRoles = await getPersonRolesForPhone(phone));
// 		console.log('response==>', res_);

// 			availableRoles = res_.Data?.Roles ?? [];
// 		} else if (resetData.data?.email) {
// 			var res_ = await getPersonRolesForEmail(resetData.data?.email);
// 			availableRoles = res_.Data?.Roles ?? [];
// 		}

// 		availableRoles = res_.Data?.Roles ?? [];

// 		console.log('availableRoles==>', availableRoles);

// 		if (availableRoles.length > 0) {
// 			filteredRoles = availableRoles.filter(
// 				(x) => x.RoleName !== 'Doctor'
// 				// && x.RoleName !== 'Patient'
// 			);

// 			if (filteredRoles.length > 0) {
// 				loginRoleId = filteredRoles[0].id;
// 			}
// 		}
// 		if (filteredRoles.length > 1) {
// 			return new Response(
// 				JSON.stringify({
// 					Status: 'failure',
// 					HttpStatusCode: 409,
// 					Message: 'Multiple administrative roles associated with email.'
// 				})
// 			);
// 		}
// 		if (filteredRoles.length == 0) {
// 			return new Response(
// 				JSON.stringify({
// 					Status: 'failure',
// 					HttpStatusCode: 409,
// 					Message: 'Found no administrative roles associated with email.'
// 				})
// 			);
// 		}
// 		console.log('filteredRoles==>', filteredRoles);

// 		// const response = await resetPassword(resetCode, newPassword, loginRoleId, email, phone);

// 		const response = await resetPassword(
// 			resetData.data?.resetCode??'',
// 			resetData.data?.newPassword??'',
// 			loginRoleId,
// 			resetData.data?.email ?? '',
// 			phone ?? ''
// 		);

// 		if (response.Status == 'failure' || response.HttpCode !== 200) {
// 			const errors = [
// 				{
// 					field: '',
// 					message: response.Message
// 				}
// 			];
// 			return fail(400, { error: true, errors });
// 		}

// 		const responseData = response.Data;
// 	// console.log(response);


// 		throw redirect(302, '/');
// 	}

// };

// const resetPasswordSchema = z
// 	.object({
// 		email: z.string().email({ message: 'Invalid email address' }).optional(),
// 		phone: z.string().optional(),
// 		resetCode: z.string().min(6, { message: 'Reset code must be 6 characters' }),
// 		newPassword: z
// 			.string()
// 			.regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/, {
// 				message:
// 					'Password should contain at least 1 capital letter, 1 small letter, 1 digit, and 1 special character.'
// 			})
// 			.min(8, {
// 				message: 'Password must be 8 characters'
// 			}),
// 		confirmPassword: z
// 			.string()
// 			.regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/, {
// 				message:
// 					'Password should contain at least 1 capital letter, 1 small letter, 1 digit, and 1 special character.'
// 			})
// 			.min(8, {
// 				message: 'Password must be 8 characters'
// 			})
// 	})
// 	.refine((data) => data.newPassword === data.confirmPassword, {
// 		message: 'New password and confirm new password must match',
// 		path: ['confirmPassword']
// 	});
