import { ResponseHandler } from '$lib/utils/response.handler';
import { setActiveRoles } from '$lib/utils/user.active.role';
import type { RequestEvent } from '@sveltejs/kit';
import { searchRoleTypes } from '../../../services/reancare/person-role-types';
import { createSearchFilters } from '$lib/utils/search.utils';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const searchFilters = createSearchFilters(event, {
			name: event.url.searchParams.get('name') ?? undefined,
		});

		console.log('Search parms: ', searchFilters);
		const response = await searchRoleTypes(sessionId, searchFilters);
		
		const roles = response.Data.Roles;
		roles.Items = setActiveRoles(roles.Items ?? []);
		return new Response(JSON.stringify(response));
	} catch (err) {
		console.error(`Error retrieving roles: ${err.message}`);
		return new Response(err.message);
	}
};
