import { type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchPromptTemplate } from '../../../../api/services/bot-content/prompt-template';
// import { createSearchFilters } from '$lib/utils/search.utils';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const tenantId = event.locals?.sessionUser?.tenantId;
	// const tenantCode = event.locals?.sessionUser?.tenantCode; 

	// const createdByUserId = event.params.userId;

	event.depends('app:prompt-template');

	const response = await searchPromptTemplate(sessionId, {
			tenantId, 
			orderBy: 'Name',
			order: 'ascending',
			itemsPerPage: 10
		});
    
	// const searchFilters = createSearchFilters(event, {
    //     orderBy: "Name",
    //     order: "ascending",
    //     itemsPerPage: 10
    // });
    
    // console.log('Search Parameters:', searchFilters);
	// const response = await searchPromptTemplate(sessionId, searchFilters);
	const prompts = response?.Data;

	return {
		prompts,
		sessionId,
		message: response.Message
	};
};
