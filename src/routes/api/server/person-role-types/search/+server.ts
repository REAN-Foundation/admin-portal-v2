import { ResponseHandler } from '$lib/utils/response.handler';
import { setActiveRoles } from '$lib/utils/user.active.role';
import type { RequestEvent } from '@sveltejs/kit';
import { searchRoleTypes } from '../../../services/reancare/person-role-types';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const searchParams: URLSearchParams = event.url.searchParams;
		const searchFilters = {
			name: searchParams.get('name') ?? undefined,
			orderBy: searchParams.get('sortBy') ?? 'CreatedAt',
			order: searchParams.get('sortOrder') ?? 'ascending',
			itemsPerPage: parseInt(searchParams.get('itemsPerPage') ?? '10'),
			pageIndex: parseInt(searchParams.get('pageIndex') ?? '0')
		};

		console.log('Search parms: ', searchParams);
		const response = await searchRoleTypes(sessionId, searchFilters);
		
		const roles = response.Data.Roles;
		roles.Items = setActiveRoles(roles.Items ?? []);
		return new Response(JSON.stringify(response));
	} catch (err) {
		console.error(`Error retriving roles: ${err.message}`);
		return new Response(err.message);
	}
};
