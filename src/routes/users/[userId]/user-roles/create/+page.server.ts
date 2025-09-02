import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { createPersonRoleType } from '../../../../api/services/reancare/person-role-types';
import { validateFormData } from '$lib/utils/formValidation';

/////////////////////////////////////////////////////////////////////////

const createPersonRoleSchema = zfd.formData({
	roleName: z.string().min(1).max(32),
	description: z.string().optional()
});

export const actions = {
	createPersonRoleTypeAction: async (event: RequestEvent) => {
		const request = event.request;
		const userId = event.params.userId;
		const sessionId = event.cookies.get('sessionId');
		const { result, errors } = await validateFormData(request, createPersonRoleSchema);

        if (errors) {
            return { data: result, errors };
        }

        let response;
        try {
            response = await createPersonRoleType(
                sessionId, result.roleName, result.description
            );
        } catch (error: any) {
            const errorMessageText = error?.body?.message || 'An error occurred';
            throw redirect(
				303,
				`/users/${userId}/user-roles`,
				errorMessage(errorMessageText),
				event
			);
        }
        const id = response.Data.RoleType.id;
        throw redirect(
			303,
			`/users/${userId}/user-roles/${id}/view`,
			successMessage(`User role created successfully!`),
			event
		);
	}
};
