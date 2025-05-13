import { getWebLinkById } from '$routes/api/services/careplan/assets/web-link';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const webLinkId = event.params.id;

	const response = await getWebLinkById(sessionId, webLinkId);

	const webLink = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		webLink,
		message: response?.Message || 'Web-link retrieved successfully',
		title: 'Web-link View'
	};
};
