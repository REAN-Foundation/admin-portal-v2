import type { ServerLoadEvent } from '@sveltejs/kit';
import { BACKEND_API_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';
import { searchSymptoms } from '../../../api/services/reancare/symptoms';
import { createSearchFilters } from '$lib/utils/search.utils';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:symptoms');
	const searchFilters = createSearchFilters(event, {
		orderBy: 'Symptom',
		order: 'ascending',
		itemsPerPage: 10
	});
	
	console.log('Search Parameters:', searchFilters);
	const response = await searchSymptoms(sessionId, searchFilters);

	// const symptomsCount = response?.Data?.SymptomTypes?.TotalCount || [];
	const symptoms = response?.Data?.SymptomTypes || [];

	return {
		// symptomsCount,
		symptoms,
		sessionId,
		message: response?.Message || 'Health Systems retrieved successfully',
		backendUrl: BACKEND_API_URL,
		title: 'Clinical-Symptoms'
	};
};
