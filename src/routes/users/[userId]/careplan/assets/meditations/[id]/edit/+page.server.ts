import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getMeditationById } from '$routes/api/services/careplan/assets/meditations';
////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const meditationId = event.params.id;
	const response = await getMeditationById(sessionId, meditationId);

	const meditation = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		meditation,
		message: response?.Message || 'Meditation retrieved successfully',
		title: 'Meditation Edit'
	};
};

