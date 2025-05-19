import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getVideoById } from '$routes/api/services/careplan/assets/video';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const videoId = event.params.id;
	const response = await getVideoById(sessionId, videoId);

	const video = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		video,
		message: response?.Message || 'Video retrieved successfully',
		title: 'Video Edit'
	};
};
