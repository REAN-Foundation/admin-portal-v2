import type { RequestEvent } from '@sveltejs/kit';
import { searchPromptTemplate } from '../../../services/bot-content/prompt-template';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createSearchFilters } from '$lib/utils/search.utils';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		const tenantCode = event.locals?.sessionUser?.tenantCode;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const searchFilters = createSearchFilters(event, {
			name: event.url.searchParams.get('name') ?? undefined,
			excludeTenantId: true
		});
		delete searchFilters.excludeTenantId;

		// Backend expects tenantCode value in the tenantId field (not UUID)
		if (tenantCode) {
			searchFilters.tenantId = tenantCode;
		}

		const response = await searchPromptTemplate(sessionId, searchFilters);

		return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving prompt-template:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
