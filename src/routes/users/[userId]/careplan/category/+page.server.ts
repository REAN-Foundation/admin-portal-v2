import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchCareplanCategories } from '$routes/api/services/careplan/careplan.category';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	// const tenantId = event.locals.sessionUser.tenantId;
	event.depends('app:healthSystem');
	const response = await searchCareplanCategories(sessionId, {
		orderBy: 'Type',
		order: 'ascending',
		itemsPerPage: 10
	});

	const careplanCategories = response?.Data?.Items || [];
	const totalCount = response?.Data?.TotalCount || 0;

	return {
		careplanCategories,
		totalCount,
		sessionId,
		message: response?.Message || 'careplan categories retrieved successfully',
		title: 'Care Plan Categories'
	};
};
