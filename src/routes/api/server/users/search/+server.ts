import type { RequestEvent } from '@sveltejs/kit';
import { addPermissionMatrix, searchUsers } from '../../../services/reancare/user';
import { ResponseHandler } from '$lib/utils/response.handler';
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
		const searchParams: URLSearchParams = event.url.searchParams;

		const searchFilters = {
			firstName: searchParams.get('firstName') ?? undefined,
			email: searchParams.get('email') ?? undefined,
			phone: searchParams.get('phone') ?? undefined,
			roleIds: searchParams.get('roleIds') ?? undefined,
			orderBy: searchParams.get('sortBy') ?? 'CreatedAt',
			order: searchParams.get('sortOrder') ?? 'ascending',
			itemsPerPage: parseInt(searchParams.get('itemsPerPage') ?? '10'),
			pageIndex: parseInt(searchParams.get('pageIndex') ?? '0')
		};

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
		console.error(`Error retriving users: ${err.message}`);
		return new Response(err.message);
	}
};
