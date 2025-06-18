import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getMessageById } from '$routes/api/services/careplan/assets/messages';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const messageId = event.params.id;
	const tenantId = event.locals.sessionUser.tenantId;

	const response = await getMessageById(sessionId, messageId);

	const message = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		message:message,
		tenantId,
		statusMessage: response?.Message || 'Message updated successfully',
		title: 'Message Edit'
	};
};

