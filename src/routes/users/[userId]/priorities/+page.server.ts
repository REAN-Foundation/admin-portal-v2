import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchPriorities } from '../../../api/services/reancare/priorities';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:priorities');
	const response = await searchPriorities(sessionId, {
		orderBy: 'Type',
		order: 'ascending'
	});

	const priorityTypes = response?.Data?.PriorityTypes || [];
	console.log('priorityTypes==>', priorityTypes);
	return {
		priorityTypes,
		sessionId,
		message: response?.Message || 'Priority Types retrieved successfully',
		title: 'Types-Priorities'
	};
};
