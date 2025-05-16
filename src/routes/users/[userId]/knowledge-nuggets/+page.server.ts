import type { RequestEvent, ServerLoadEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchKnowledgeNuggets } from '../../../api/services/reancare/knowledge-nuggets';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	event.depends('app:knowledge-nuggests');
	const response = await searchKnowledgeNuggets(sessionId, {
		orderBy: 'TopicName',
		order: 'ascending',
		itemsPerPage: 10
	});

	const knowledgeNuggets = response?.Data?.KnowledgeNuggetRecords || [];
	return {
		knowledgeNuggets,
		sessionId,
		message: response?.Message || 'Knowledge nuggets retrieved successfully',
		title: 'Educational-Knowledge Nuggets'
	};
};
