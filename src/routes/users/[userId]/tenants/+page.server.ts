import type { RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { redirect } from 'sveltekit-flash-message/server';
import { errorMessage } from '$lib/utils/message.utils';
import { searchTenants } from '../../../api/services/reancare/tenants';

//////////////////////////////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const userId = event.params.userId;
	console.log('sessionId', sessionId);

	try {
		const response = await searchTenants(sessionId);
		const tenants = response.Data.TenantRecords;
		return {
			tenants,
			sessionId,
			message: response.Message
		};
	} catch (error) {
		console.error(`Error retrieving tenants: ${error.message}`);
		throw redirect(303, `/users/${userId}/home`, errorMessage('Error retrieving tenants'), event);
	}
};
