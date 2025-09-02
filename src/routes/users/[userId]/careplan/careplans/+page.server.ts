import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchCareplan } from '$routes/api/services/careplan/careplans';
import { createSearchFilters } from '$lib/utils/search.utils';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');

	const searchFilters = createSearchFilters(event, {
		orderBy: 'Name',
		order: 'ascending',
		itemsPerPage: 10
	});
	
	console.log('Search Parameters:', searchFilters);
	const response = await searchCareplan(sessionId, searchFilters);

	const carePlans = response?.Data || [];

	return {
		carePlans,
		sessionId,
		message: response?.Message || 'care plans retrieved successfully',
		title: 'Care Plans'
	};
};
