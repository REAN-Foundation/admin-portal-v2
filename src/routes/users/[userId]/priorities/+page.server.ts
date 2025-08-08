import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchPriorities } from '../../../api/services/reancare/priorities';
import { createSearchFilters } from '$lib/utils/search.utils';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:priorities');
	const searchFilters = createSearchFilters(event, {
		orderBy: 'Type',
		order: 'ascending',
		itemsPerPage: 10
	});
	
	console.log('Search Parameters:', searchFilters);
	const response = await searchPriorities(sessionId, searchFilters);

	const priorityTypes = response?.Data?.PriorityTypes || [];
	console.log('priorityTypes==>', priorityTypes);
	return {
		priorityTypes,
		sessionId,
		message: response?.Message || 'Priority Types retrieved successfully',
		title: 'Types-Priorities'
	};
};
