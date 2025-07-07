import type { RequestEvent } from '@sveltejs/kit';
import { searchPromptTemplate } from '../../../services/bot-content/prompt-template';
import { ResponseHandler } from '$lib/utils/response.handler';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}
		const searchParams: URLSearchParams = event.url.searchParams;
		const searchFilters = {
			name: searchParams.get('name') ?? undefined,
			orderBy: searchParams.get("sortBy") ?? "CreatedAt",
            order: searchParams.get("sortOrder") ?? "ascending",
            itemsPerPage: parseInt(searchParams.get("itemsPerPage") ?? "10"),
            pageIndex: parseInt(searchParams.get("pageIndex") ?? "0"),
		};

		const response = await searchPromptTemplate(sessionId, searchFilters);
		
		return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving prompt-template:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
