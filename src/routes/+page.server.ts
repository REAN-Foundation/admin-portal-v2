
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import type { PersonRole } from '$lib/types/domain.models';
import { getUserRoles } from './api/services/reancare/types';
import { UserRoles } from '$lib/system.types';
// import { getPersonRolesForEmail, getPersonRolesForPhone } from './api/services/person';

/////////////////////////////////////////////////////////////

export const load: PageServerLoad = async () => {
	try {
		let roles: PersonRole[] = await getUserRoles();
		if (!roles || roles.length === 0) {
			roles = UserRoles;
		}

		return {
			message: 'Common data successfully retrieved!',
			roles,
		};
	} catch (error) {
		console.error(`Error retrieving data :`, error);
		throw redirect(303, '/');
	}
};

/////////////////////////////////////////////////////
