import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTenantById } from '../../../../../api/services/reancare/tenants';
////////////////////////////////////////////////////////////////////////////

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
