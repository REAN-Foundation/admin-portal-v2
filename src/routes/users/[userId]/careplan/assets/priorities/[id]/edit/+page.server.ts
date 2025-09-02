import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPriorityById } from '$routes/api/services/careplan/assets/priority';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const priorityId = event.params.id;
	const tenantId = event.locals.sessionUser.tenantId;

	const response = await getPriorityById(sessionId, priorityId);

	const priority = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		priority,
		tenantId,
		message: response?.Message || 'Priority retrieved successfully',
		title: 'Priority Edit'
	};
};
