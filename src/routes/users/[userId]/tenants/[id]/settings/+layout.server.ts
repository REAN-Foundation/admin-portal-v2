import type { RequestEvent } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getTenantById } from '../../../../../api/services/reancare/tenants';

////////////////////////////////////////////////////////////////////////////

export const load: LayoutServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId') as string;
	const tenantId = event.params.id as string;
	let tenantName = '';

	try {
		const response = await getTenantById(sessionId, tenantId);
		if (response?.Data?.Tenant?.Name) {
			tenantName = response.Data.Tenant.Name;
		}
	} catch {
		// Fallback: breadcrumb will just omit the tenant name
	}

	return {
		tenantName
	};
};
