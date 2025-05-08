import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAudioById } from '../../../../../../../api/services/careplan/assets/audio';


////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const audioId = event.params.id;
	const response = await getAudioById(sessionId, audioId);

	const audio = response?.Data;
	const id = audio?.id;

	return {
		location: `${id}/edit`,
		audio,
		message: response?.Message || 'audio retrieved successfully',
		title: 'audio Edit'
	};
};

