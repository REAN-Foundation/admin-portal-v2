import type { ServerLoadEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchPersonRoleTypes } from '../../../api/services/reancare/person-role-types';
import { addPermissionMatrix, searchUsers } from '../../../api/services/reancare/user';
import { createSearchFilters } from '$lib/utils/search.utils';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	console.log('sessionId.....', sessionId);
	event.depends('app:users');
	const tenantId = event.locals.sessionUser.tenantId;
	const userRole = event.locals.sessionUser.roleName;
	const userId = event.locals.sessionUser.userId;
	const userRoleId = event.locals.sessionUser.roleId;
	console.log('tenantId.....', tenantId);

	const personRoles = await searchPersonRoleTypes(sessionId);
	if (personRoles.Status === 'failure' || personRoles.HttpCode !== 200) {
		throw error(personRoles.HttpCode, personRoles.Message);
	}
	const selectedRoles: string[] = [];
	personRoles.Data.PersonRoleTypes.map((personRole) => {
		if (
			personRole.RoleName === 'System admin' ||
			personRole.RoleName === 'System user' ||
			personRole.RoleName === 'Tenant admin' ||
			personRole.RoleName === 'Tenant user'
		) {
			selectedRoles.push(personRole.id);
		}
	});

	const searchFilters = createSearchFilters(event, {
		orderBy: 'CreatedAt',
		order: 'ascending',
		itemsPerPage: 10,
		roleIds: selectedRoles.length ? (selectedRoles as string[]) : null
	});
	
	console.log('Search Parameters:', searchFilters);
	const response = await searchUsers(sessionId, searchFilters);
	if (response.Status === 'failure' || response.HttpCode !== 200) {
		throw error(response.HttpCode, response.Message);
	}
	const users = response.Data.Users;
	users.Items = await addPermissionMatrix(
		sessionId,
		users.Items,
		userRole,
		userId,
		tenantId,
		userRoleId
	);
	console.log('User Role After Add Permission Matrix', users.Items);
	return {
		users,
		sessionId,
		message: response.Message,
		selectedRoles,
		title: 'Administration-Users'
	};
};
