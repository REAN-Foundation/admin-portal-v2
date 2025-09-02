import { error, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchDrugs } from '../../../api/services/reancare/drugs';
import { createSearchFilters } from '$lib/utils/search.utils';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:drugs');
	const searchFilters = createSearchFilters(event, {
		orderBy: 'DrugName',
		order: 'ascending',
		itemsPerPage: 10
	});
	
	console.log('Search Parameters:', searchFilters);
	const response = await searchDrugs(sessionId, searchFilters);
	if (response.Status === 'failure' || response.HttpCode !== 200) {
		throw error(response.HttpCode, response.Message);
	}
	const drugs = response?.Data?.Drugs || [];
	return {
		drugs,
		sessionId,
		message: response?.Message || 'Drugs retrieved successfully',
		title: 'Clinical-Drugs'
	};
};
