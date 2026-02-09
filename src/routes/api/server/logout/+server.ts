import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CookieUtils } from '$lib/helper/cookie.utils';
import { SessionManager } from '../../../api/cache/session/session.manager';
import { DashboardManager } from '../../../api/cache/dashboard/dashboard.manager';
import { logoutUser } from '../../../api/services/reancare/user';

///////////////////////////////////////////////////////////////////////////////

export const POST: RequestHandler = async ({ cookies, request }) => {
	try {
		const sessionId = cookies.get('sessionId');

		if (sessionId) {
			console.log("Inside the logout endpoint")
			let deviceToken: string | undefined;
			try {
				const body = await request.json();
				deviceToken = body.deviceToken;
			} catch {
				// No body or invalid JSON, deviceToken remains undefined
			}

			await logoutUser(sessionId, deviceToken);
			const sessionCachePattern = `session-${sessionId}:`;
			await DashboardManager.findAndClear([sessionCachePattern]);
			await SessionManager.removeSession(sessionId);
		}
		CookieUtils.removeCookieHeader({ cookies } as any, 'sessionId');

		return json({
			success: true,
			message: 'Logout successful!'
		});

	} catch (error) {
		console.error('Logout error:', error);
		return json({
			success: false,
			message: 'An unexpected error occurred during logout'
		}, { status: 500 });
	}
};
