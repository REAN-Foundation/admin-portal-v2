import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loginAsUser } from '../../../api/services/reancare/user';
import { CookieUtils } from '$lib/helper/cookie.utils';
import { getUserRoles } from '../../../api/services/reancare/types';
import { UserRoles } from '$lib/system.types';
import { getPersonRolesForEmail, getPersonRolesForPhone } from '../../../api/services/person';
import { SessionManager } from '../../../api/cache/session/session.manager';
// import type { Session } from '../../../api/cache/session';
import { loginSchema } from '$lib/validation/login.schema';
import type { PersonRole } from '$lib/types/domain.models';

import type { Session } from '../../../api/cache/session';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const loginData = await request.json();
		
		// Validate the login data
		const validationResult = loginSchema.safeParse(loginData);
		if (!validationResult.success) {
			const errors = validationResult.error.errors.map((error) => ({
				field: error.path[0],
				message: error.message
			}));
			return json({ 
				success: false, 
				message: 'Validation failed', 
				errors 
			}, { status: 400 });
		}

		const { username, password, email, phone, countryCode, loginType } = validationResult.data;
		
		// Get all available roles
		let allRoles: PersonRole[] = await getUserRoles();
		if (!allRoles || allRoles.length === 0) {
			allRoles = UserRoles;
		}

		let availableRoles: PersonRole[] = [];
		let filteredRoles: PersonRole[] = [];
		let loginRoleId = null;
		let phoneNumber = '';

		// Determine role based on login type
		if (loginType === 'phone' && phone && countryCode) {
			phoneNumber = countryCode + '-' + phone;
			const phoneRolesResponse = await getPersonRolesForPhone(phoneNumber);
			availableRoles = phoneRolesResponse.Data?.Roles ?? [];
		} else if (loginType === 'email' && email) {
			const emailRolesResponse = await getPersonRolesForEmail(email);
			availableRoles = emailRolesResponse.Data?.Roles ?? [];
		}

		// Filter roles based on available roles or fallback to all roles
		if (availableRoles.length > 0) {
			filteredRoles = availableRoles.filter(
				(x: any) => x.RoleName !== 'Doctor' && x.RoleName !== 'Patient'
			);
			if (filteredRoles.length > 0) {
				loginRoleId = filteredRoles[0].id;
			}
		} else {
			if (allRoles.length > 0) {
				if (username && username === 'admin') {
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

		if (filteredRoles.length === 0) {
			return json({ 
				success: false, 
				message: 'Invalid user! No valid roles found.' 
			}, { status: 400 });
		}

		// Attempt login
		const response = await loginAsUser(
			loginRoleId,
			password,
			username ?? '',
			email ?? '',
			phoneNumber
		);

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			return json({ 
				success: false, 
				message: response.Message 
			}, { status: 400 });
		}

		// Create session
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

		if (!session) {
			return json({ 
				success: false, 
				message: 'User login session cannot be created!' 
			}, { status: 500 });
		}

        console.log('Session ' + JSON.stringify(session));
        const userSession = await SessionManager.addSession(
            session?.sessionId as string,
            session as Session
        );
        console.log('User Session ' + JSON.stringify(userSession));

		// Set session cookie
		CookieUtils.setCookieHeader({ cookies } as any, 'sessionId', sessionId);

		return json({
			success: true,
			message: 'Login successful!',
			data: {
				userId,
				sessionId,
				redirectUrl: `/users/${userId}/home`
			}
		});

	} catch (error) {
		console.error('Login error:', error);
		return json({ 
			success: false, 
			message: 'An unexpected error occurred during login' 
		}, { status: 500 });
	}
};
