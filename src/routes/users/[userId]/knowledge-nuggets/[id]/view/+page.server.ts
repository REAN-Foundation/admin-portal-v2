import { error, type RequestEvent, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getKnowledgeNuggetById } from '../../../../../api/services/reancare/knowledge-nuggets';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const knowledgeNuggetsId = event.params.id;
	const response = await getKnowledgeNuggetById(sessionId, knowledgeNuggetsId);

	// if (response.Status === 'failure' || response.HttpCode !== 200) {
	//     throw error(response.HttpCode, response.Message);
	// }
	const knowledgeNugget = response?.Data?.KnowledgeNugget;
	const id = response?.Data?.KnowledgeNugget.id;

	return {
		location: `${id}/edit`,
		knowledgeNugget,
		message: response.Message,
		title: 'Educational-Knowledge Nuggets View'
	};
};
