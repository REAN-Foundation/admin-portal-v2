import { redirect, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchTenants } from '../../../api/services/reancare/tenants';
import { createSearchFilters } from '$lib/utils/search.utils';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:tenant');

	const normalizedRoleName = (event.locals.sessionUser?.roleName ?? '').trim().toLowerCase();
	const isTenantAdmin = normalizedRoleName === 'tenant admin';
	if (isTenantAdmin) {
		const userId = event.params.userId;
		const tenantId = event.locals.sessionUser?.tenantId;
		if (tenantId) {
			throw redirect(302, `/users/${userId}/tenants/${tenantId}/settings`);
		}
	}

	const searchFilters = createSearchFilters(event, {
		orderBy: 'CreatedAt',
		order: 'ascending',
		itemsPerPage: 10
	});
	
	console.log('Search Parameters:', searchFilters);
	const response = await searchTenants(sessionId, searchFilters);
	const tenants = response?.Data?.TenantRecords || [];

	console.log('tenants ==>', tenants);

	return {
		tenants,
		sessionId,
		message: response?.Message || 'Tenants retrieved successfully',
		title: 'Tenant List'
	};
};
