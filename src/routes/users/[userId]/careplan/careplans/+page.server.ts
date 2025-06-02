import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchCareplan } from '$routes/api/services/careplan/careplans';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');

	const response = await searchCareplan(sessionId, {
		orderBy: 'Name',
		order: 'ascending',
		itemsPerPage: 10
	});

	const carePlans = response?.Data || [];

	return {
		carePlans,
		sessionId,
		message: response?.Message || 'care plans retrieved successfully',
		title: 'Care Plans'
	};
};
