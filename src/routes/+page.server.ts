
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import type { PersonRole } from '$lib/types/domain.models';
import { getUserRoles } from './api/services/reancare/types';
import { UserRoles } from '$lib/system.types';
import { getPersonRolesForEmail, getPersonRolesForPhone } from './api/services/person';

/////////////////////////////////////////////////////////////

export const load: PageServerLoad = async () => {
	try {
		let roles: PersonRole[] = await getUserRoles();
		if (!roles || roles.length === 0) {
			roles = UserRoles;
		}

		// Load roles for email and phone login methods
		let emailRoles: PersonRole[] = [];
		let phoneRoles: PersonRole[] = [];

		// Get roles for email login (you can customize this based on your requirements)
		try {
			const emailRolesResponse = await getPersonRolesForEmail(''); // Empty email to get all possible roles
			emailRoles = emailRolesResponse.Data?.Roles ?? [];
		} catch (error) {
			console.error('Error loading email roles:', error);
		}

		// Get roles for phone login (you can customize this based on your requirements)
		try {
			const phoneRolesResponse = await getPersonRolesForPhone(''); // Empty phone to get all possible roles
			phoneRoles = phoneRolesResponse.Data?.Roles ?? [];
		} catch (error) {
			console.error('Error loading phone roles:', error);
		}

		return {
			message: 'Common data successfully retrieved!',
			roles,
			emailRoles,
			phoneRoles
		};
	} catch (error) {
		console.error(`Error retrieving data :`, error);
		throw redirect(303, '/');
	}
};

/////////////////////////////////////////////////////
