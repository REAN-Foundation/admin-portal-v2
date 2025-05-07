import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { createTenant } from '../../../../api/services/rean-care/tenants';

/////////////////////////////////////////////////////////////////////////

const createTenantSchema = zfd.formData({
	name: z.string().min(3).max(256),
	description: z.string().optional(),
	code: z.string().optional(),
	phone: z.string().min(10).max(64),
	email: z.string().email().min(10).max(64)
});

export const actions = {
	createTenantAction: async (event: RequestEvent) => {
		const request = event.request;
		const userId = event.params.userId;
		const sessionId = event.cookies.get('sessionId');
		const data = await request.formData();
		const formData = Object.fromEntries(data);

		const tags = data.has('tags') ? data.getAll('tags') : [];
		const formDataValue = { ...formData, tags: tags };

		type TenantSchema = z.infer<typeof createTenantSchema>;

		let result: TenantSchema = {};
		try {
			result = createTenantSchema.parse(formDataValue);
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

		const response = await createTenant(
			sessionId,
			result.name,
			result.description,
			result.code,
			result.phone,
			result.email
		);
		const id = response.Data.Tenant.id;

		if (response.Status === 'failure' || response.HttpCode !== 201) {
			throw redirect(303, `/users/${userId}/tenants`, errorMessage(response.Message), event);
		}
		throw redirect(
			303,
			`/users/${userId}/tenants/${id}/view`,
			successMessage(`Tenant created successfully!`),
			event
		);
	}
};
