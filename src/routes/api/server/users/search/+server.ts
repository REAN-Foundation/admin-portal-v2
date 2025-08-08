import type { RequestEvent } from '@sveltejs/kit';
import { addPermissionMatrix, searchUsers } from '../../../services/reancare/user';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createSearchFilters } from '$lib/utils/search.utils';
//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const tenantId = event.locals?.sessionUser?.tenantId;
		const userRole = event.locals?.sessionUser?.roleName;
		const userId = event.locals?.sessionUser?.userId;
		const userRoleId = event.locals.sessionUser.roleId;

		const searchFilters = createSearchFilters(event, {
			firstName: event.url.searchParams.get('firstName') ?? undefined,
			email: event.url.searchParams.get('email') ?? undefined,
			phone: event.url.searchParams.get('phone') ?? undefined,
			roleIds: event.url.searchParams.get('roleIds') ?? undefined,
		});

		const response = await searchUsers(sessionId, searchFilters);

		const users = response.Data.Users;
		// console.log("---",  users);
		users.Items = await addPermissionMatrix(
			sessionId,
			users.Items,
			userRole,
			userId,
			tenantId,
			userRoleId
		);
		// console.log("***",  users);
		return new Response(JSON.stringify(users));
	} catch (err) {
		console.error(`Error retrieving users: ${err.message}`);
		return new Response(err.message);
	}
};
