import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent, ServerLoadEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { createUser, getUserRoleList } from '../../../../api/services/reancare/user';
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

