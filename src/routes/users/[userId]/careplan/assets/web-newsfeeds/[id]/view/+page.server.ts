import { getWebNewsfeedById } from '$routes/api/services/careplan/assets/web-newsfeeds';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const webnewsfeedId = event.params.id;

	const response = await getWebNewsfeedById(sessionId, webnewsfeedId);

	const webNewsfeed = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		webNewsfeed,
		message: response?.Message || 'Web-Newsfeed retrieved successfully',
		title: 'Web-Newsfeed View'
	};
};
