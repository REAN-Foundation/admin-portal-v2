import { ResponseHandler } from '$lib/utils/response.handler';
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchCareplanCategories } from '$routes/api/services/careplan/careplan.category';
import type { RequestEvent } from '@sveltejs/kit';

/////////////////////////////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {

	try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const searchFilters = createSearchFilters(event, {
            useTenantCode: true,
            type: event.url.searchParams.get("type") ?? undefined,
        });

        const response = await searchCareplanCategories(sessionId, searchFilters);
        return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving health systems:", error);
        return ResponseHandler.handleError(500, null, error);
    }
}; 