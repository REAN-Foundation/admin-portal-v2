import { fail } from '@sveltejs/kit';
import z from 'zod';
import type { Actions, RequestEvent } from '@sveltejs/kit';
import { loginAsUser } from './api/services/reancare/user';
import { CookieUtils } from '$lib/helper/cookie.utils';
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import type { PersonRole } from '$lib/types/domain.models';
import { getUserRoles } from './api/services/reancare/types';
import { UserRoles } from '$lib/system.types';
import { getPersonRolesForEmail, getPersonRolesForPhone } from './api/services/person';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { SessionManager } from './api/cache/session/session.manager';
import type { Session } from './api/cache/session';

/////////////////////////////////////////////////////////////

export const load: PageServerLoad = async () => {
	try {
		let roles: PersonRole[] = await getUserRoles();
		if (!roles || roles.length === 0) {
			roles = UserRoles;
		}
		return {
			message: 'Common data successfully retrieved!',
			roles
		};
	} catch {
		console.error(`Error retrieving data :`);
		throw redirect(303, '/');
	}
};

/////////////////////////////////////////////////////

export const actions: Actions = {
	login: async (event:RequestEvent) => {
		const loginFormData = Object.fromEntries(await event.request.formData());
		const credentials = loginSchema.safeParse(loginFormData);
		const result = credentials.data;
		console.log(`${credentials.data?.username} ${credentials.data?.password}`);
		if (!credentials.success) {
			const errors = credentials.error.errors.map((error) => {
				return {
					field: error.path[0],
					message: error.message
				};
			});
			return fail(400, { error: true, errors });
		}

		let phone;
		const allRoles: PersonRole[] = await getUserRoles();
		let availableRoles: PersonRole[] = [];
		let filteredRoles: PersonRole[] = [];
		let loginRoleId = null;

		if (result?.phone && result.countryCode) {
			phone = result.countryCode + '-' + result.phone;
			const res_ = (availableRoles = await getPersonRolesForPhone(phone));
			console.log(phone);
			availableRoles = res_.Data?.Roles ?? [];
		} else if (result?.email) {
			const res_ = await getPersonRolesForEmail(result.email);
			availableRoles = res_.Data?.Roles ?? [];
		}

		if (availableRoles.length > 0) {
			filteredRoles = availableRoles.filter(
				(x: PersonRole) => x.RoleName !== 'Doctor'
				&& x.RoleName !== 'Patient'
			);
			if (filteredRoles.length > 0) {
				loginRoleId = filteredRoles[0].id;
			}
		} else {
			if (allRoles.length > 0) {
				if (result?.username && result?.username === 'admin') {
					filteredRoles = allRoles.filter((x) => x.RoleName === 'System admin');
					if (filteredRoles.length > 0) {
						loginRoleId = filteredRoles[0].id;
					}
				} else {
					filteredRoles = allRoles.filter(
						(x) =>
							x.RoleName === 'System user' ||
							x.RoleName === 'Tenant admin' ||
							x.RoleName === 'Tenant user'
					);
					if (filteredRoles.length > 0) {
						loginRoleId = filteredRoles[0].id;
					}
				}
			}
		}

		if (filteredRoles.length == 0) {
			throw redirect(303, '/', errorMessage('Invalid user!'), event);
		}

		const response = await loginAsUser(
			loginRoleId,
			credentials.data?.password,
			credentials.data?.username ?? '',
			credentials.data?.email ?? '',
			phone
		);
		if (response.Status == 'failure' || response.HttpCode !== 200) {
			const errors = [
				{
					field: 'general',
					message: response.Message || 'Invalid username or password'
				}
			];
			return fail(400, { error: true, errors });
		}

		const user = response.Data.User;
		user.SessionId = response.Data.SessionId;
		const accessToken = response.Data.AccessToken;
		const refreshToken = response.Data.RefreshToken;
		const expiryDate = new Date(response.Data.SessionValidTill);
		const sessionId = response.Data.SessionId;
		const userId: string = response.Data.User.id;

		const session = await SessionManager.constructSession(
			user,
			accessToken,
			expiryDate,
			refreshToken
		);
		console.log('Session ' + JSON.stringify(session));
		const userSession = await SessionManager.addSession(
			session?.sessionId as string,
			session as Session
		);
		console.log('User Session ' + JSON.stringify(userSession));
		if (!session) {
			throw redirect(303, `/`, errorMessage(`Use login session cannot be created!`), event);
		}
		CookieUtils.setCookieHeader(event, 'sessionId', sessionId);

		throw redirect(303, `/users/${userId}/home`, successMessage(`Login successful!`), event);
	}
};

const loginSchema = z.object({
	username: z.string().trim().min(1, { message: "Name can't be empty" }).optional(),
	password: z.string().trim().min(1, { message: 'Password can`t be empty' }),
	email: z.string().optional(),
	phone: z.string().optional(),
	countryCode: z.string().optional()
});
