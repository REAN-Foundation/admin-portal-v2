import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchHospitals } from '../../../api/services/reancare/hospitals';
import { createSearchFilters } from '$lib/utils/search.utils';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:healthSystem');
	const searchFilters = createSearchFilters(event, {
		orderBy: 'Name',
		order: 'ascending',
		itemsPerPage: 10
	});
	
	console.log('Search Parameters:', searchFilters);
	const response = await searchHospitals(sessionId, searchFilters);

	const hospitals = response?.Data?.Hospitals || [];

	return {
		hospitals,
		sessionId,
		message: response?.Message || 'Hospitals retrieved successfully',
		title: 'Hospital Systems-Hospitals'
	};
};
