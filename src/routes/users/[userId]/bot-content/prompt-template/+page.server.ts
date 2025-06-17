import { error, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchPromptTemplate } from '../../../../api/services/bot-content/prompt-template';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');

	const createdByUserId = event.params.userId;

	event.depends('app:prompt-template');

	const response = await searchPromptTemplate(sessionId);

	const prompts = response?.Data;

	return {
		prompts,
		sessionId,
		message: response.Message
	};
};
