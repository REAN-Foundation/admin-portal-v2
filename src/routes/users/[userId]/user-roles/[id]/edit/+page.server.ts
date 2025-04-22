import type { PageServerLoad } from './$types';
import { error, type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import {
	getPersonRoleTypeById,
	updatePersonRoleType
} from '../../../../../api/services/reancare/person-role-types';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const personRoleTypeId = event.params.id;
	const response = await getPersonRoleTypeById(sessionId, personRoleTypeId);

	if (response.Status === 'failure' || response.HttpCode !== 200) {
		throw error(response.HttpCode, response.Message);
	}
	const personRoleType = response.Data.RoleType;
	const id = response.Data.RoleType.id;
	return {
		location: `${id}/edit`,
		personRoleType,
		message: response.Message,
		title:'Administration-User Roles Edit'
	};

};

const updatePersonRoleSchema = zfd.formData({
	roleName: z.string().min(1).max(32),
	description: z.string().optional()
});

export const actions = {
	updatePersonRoleTypeAction: async (event: RequestEvent) => {
		const request = event.request;
		const userId = event.params.userId;
		const personRoleTypeId = event.params.id;
		const sessionId = event.cookies.get('sessionId');
		const formData = Object.fromEntries(await request.formData());

		type PersonRoleTypeSchema = z.infer<typeof updatePersonRoleSchema>;

		let result: PersonRoleTypeSchema = {};
		try {
			result = updatePersonRoleSchema.parse(formData);
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

		const response = await updatePersonRoleType(
			sessionId,
			personRoleTypeId,
			result.roleName,
			result.description
		);
		const id = response.Data.RoleType.id;

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw redirect(
				303,
				`/users/${userId}/user-roles`,
				errorMessage(response.Message),
				event
			);
		}
		throw redirect(
			303,
			`/users/${userId}/user-roles/${id}/view`,
			successMessage(`User role updated successfully!`),
			event
		);
	}
};
