import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getMessageById } from '$routes/api/services/careplan/assets/messages';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const messagesId = event.params.id;
	const response = await getMessageById(sessionId, messagesId);

	const messages = response?.Data;
	const id = messages?.id;

	return {
		location: `${id}/edit`,
		message:messages,
		statusMessage: response?.Message || 'Message retrieved successfully',
		title: 'Message Edit'
	};
};

