import { error, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchTenants } from '../../../api/services/reancare/tenants';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:tenants');
	try {
		const response = await searchTenants(sessionId);
		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}
		const tenants = response.Data.TenantRecords;
		return {
			tenants,
			sessionId,
			message: response.Message
		};
	} catch (error) {
		console.error(`Error retriving tenants: ${error.message}`);
	}
};
