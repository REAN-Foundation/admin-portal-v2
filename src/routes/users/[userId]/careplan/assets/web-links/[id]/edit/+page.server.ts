import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getWebLinkById } from '$routes/api/services/careplan/assets/web-link';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const webLinkId = event.params.id;
	const tenantId = event.locals.sessionUser.tenantId;

	const response = await getWebLinkById(sessionId, webLinkId);

	const webLink = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		webLink,
		tenantId,
		message: response?.Message || 'Web-Link retrieved successfully',
		title: 'Web-Link Edit'
	};
};
