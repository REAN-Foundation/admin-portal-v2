import { redirect } from 'sveltekit-flash-message/server';
import { error, type RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';

import type { PageServerLoad } from './$types';
import { getTenantById, updateTenant } from '../../../../../api/services/rean-care/tenants';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');

	try {
		const tenantId = event.params.id;
		const response = await getTenantById(sessionId, tenantId);

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}
		const tenant = response.Data.Tenant;
		const id = response.Data.Tenant.id;
		return {
			location: `${id}/edit`,
			tenant,
			message: response.Message
		};
	} catch (error) {
		console.error(`Error retriving tenant: ${error.message}`);
	}
};

const updateTenantSchema = zfd.formData({
	name: z.string().min(3).max(256),
	description: z.string().optional(),
	code: z.string().optional(),
	phone: z.string().min(10).max(64),
	email: z.string().email().min(10).max(64)
});

export const actions = {
	updateTenantAction: async (event: RequestEvent) => {
		const request = event.request;
		const userId = event.params.userId;
		const tenantId = event.params.id;
		const sessionId = event.cookies.get('sessionId');
		const data = await request.formData();
		const formData = Object.fromEntries(data);

		const tags = data.has('tags') ? data.getAll('tags') : [];
		const formDataValue = { ...formData, tags: tags };

		type TenantSchema = z.infer<typeof updateTenantSchema>;

		let result: TenantSchema = {};
		try {
			result = updateTenantSchema.parse(formDataValue);
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

		const response = await updateTenant(
			sessionId,
			tenantId,
			result.name,
			result.description,
			result.code,
			result.phone,
			result.email
		);
		const id = response.Data.Tenant.id;

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw redirect(303, `/users/${userId}/tenants`, errorMessage(response.Message), event);
		}
		throw redirect(
			303,
			`/users/${userId}/tenants/${id}/view`,
			successMessage(`Tenant updated successfully!`),
			event
		);
	}
};
