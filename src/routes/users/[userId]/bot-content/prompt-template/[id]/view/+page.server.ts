import { error, type RequestEvent, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPromptTemplateById } from '../../../../../../api/services/bot-content/prompt-template';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const promptsId = event.params.id;
	const response = await getPromptTemplateById(sessionId, promptsId);

	const promptTemplate = response?.Data;
	const id = response?.Data?.id;
	
	return {
		location: `${id}/edit`,
		promptTemplate,
		message: response?.Message || 'Prompt template retrieved successfully',
		title: 'Bot Contents -Prompt template View'
	};
};
