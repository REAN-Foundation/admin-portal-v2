import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { searchDocuments } from '$routes/api/services/bot-content/documents';
import { createSearchFilters } from '$lib/utils/search.utils';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		const tenantId = event.locals?.sessionUser?.tenantId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const searchFilters = createSearchFilters(event, {
			name: event.url.searchParams.get('name') ?? undefined,
			documentType: event.url.searchParams.get('documentType') ?? undefined,
			tenantId:tenantId
		});

		console.log('Search parms: ', searchFilters);
		const response = await searchDocuments(sessionId, searchFilters);
		return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving documents:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
