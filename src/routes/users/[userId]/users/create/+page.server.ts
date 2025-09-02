import type { PageServerLoad } from './$types';
import { error, type ServerLoadEvent } from '@sveltejs/kit';
import { getUserRoleList } from '../../../../api/services/reancare/user';
/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {

  const userRole = event.locals.sessionUser.roleName;

  if (!userRole) {
    throw error(403, 'Invalid user role');
  }

  const userRoles = await getUserRoleList(userRole);
	return {
		UserRoles: userRoles,
		title:'Administration-Users Create'
	};

};

