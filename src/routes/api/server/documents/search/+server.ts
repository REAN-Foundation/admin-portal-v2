import type { RequestEvent } from '@sveltejs/kit';
import { searchPromptTemplate } from '../../../services/bot-content/prompt-template';
import { ResponseHandler } from '$lib/utils/response.handler';
import { searchDocuments } from '$routes/api/services/bot-content/documents';

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
			fileName: searchParams.get('fileName') ?? undefined,
			orderBy: searchParams.get('sortBy') ?? 'CreatedAt',
			order: searchParams.get('sortOrder') ?? 'ascending',
			itemsPerPage: parseInt(searchParams.get('itemsPerPage') ?? '10'),
			pageIndex: parseInt(searchParams.get('pageIndex') ?? '0')
		};

		console.log('Search parms: ', searchParams);
		const response = await searchDocuments(sessionId, searchFilters);
		return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving documents:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
