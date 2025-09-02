import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getWebNewsfeedById } from '$routes/api/services/careplan/assets/web-newsfeeds';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const webnewsfeedId = event.params.id;
	const tenantId = event.locals.sessionUser.tenantId;

	const response = await getWebNewsfeedById(sessionId, webnewsfeedId);

	const webNewsfeed = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		webNewsfeed,
		tenantId,
		message: response?.Message || 'Web-Newsfeed retrieved successfully',
		title: 'Web-Newsfeed Edit'
	};
};
