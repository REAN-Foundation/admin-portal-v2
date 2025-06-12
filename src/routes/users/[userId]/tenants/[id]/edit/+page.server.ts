import { type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTenantById } from '../../../../../api/services/reancare/tenants';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const tenantId = event.params.id;
	const response = await getTenantById(sessionId, tenantId);

	const tenant = response.Data.Tenant;
	const id = response.Data.Tenant.id;

		return {
			location: `${id}/edit`,
			tenant,
			message: response?.Message || 'Tenant retrieved successfully',
		title: 'Tenant Edit'
		};
};

