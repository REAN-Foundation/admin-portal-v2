import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchTenants } from '../../../api/services/reancare/tenants';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:tenant');

	const response = await searchTenants(sessionId);
	const tenants = response?.Data?.TenantRecords || [];

	console.log('tenants ==>', tenants);

	return {
		tenants,
		sessionId,
		message: response?.Message || 'Tenants retrieved successfully',
		title: 'Tenant List'
	};
};
