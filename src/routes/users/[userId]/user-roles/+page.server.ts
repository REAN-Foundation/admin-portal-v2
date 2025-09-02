import type { ServerLoadEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchRoleTypes } from '../../../api/services/reancare/person-role-types';
import { setActiveRoles } from '$lib/utils/user.active.role';
import { createSearchFilters } from '$lib/utils/search.utils';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	console.log('Person role types load ...');
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:user-roles');

	const searchFilters = createSearchFilters(event, {
		orderBy: 'RoleName',
		order: 'ascending',
		itemsPerPage: 10
	});
	
	console.log('Search Parameters:', searchFilters);
	const response = await searchRoleTypes(sessionId, searchFilters);
	if (response.Status === 'failure' || response.HttpCode !== 200) {
		throw error(response.HttpCode, response.Message);
	}
	const userRoles = response.Data.Roles;
	userRoles.Items = setActiveRoles(userRoles.Items ?? []);
	return {
		userRoles,
		sessionId,
		message: response.Message,
		title: 'Administration-User Roles'
	};
};
