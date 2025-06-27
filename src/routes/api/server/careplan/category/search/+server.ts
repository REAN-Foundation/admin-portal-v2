import { ResponseHandler } from '$lib/utils/response.handler';
import { searchCareplanCategories } from '$routes/api/services/careplan/careplan.category';
import type { RequestEvent } from '@sveltejs/kit';

/////////////////////////////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	
	try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const searchParams: URLSearchParams = event.url.searchParams;

        const searchFilters = {
            type: searchParams.get("type") ?? undefined,
            orderBy: searchParams.get("sortBy") ?? "CreatedAt",
            order: searchParams.get("sortOrder") ?? "ascending",
            itemsPerPage: parseInt(searchParams.get("itemsPerPage") ?? "10"),
            pageIndex: parseInt(searchParams.get("pageIndex") ?? "0"),
        };

        const response = await searchCareplanCategories(sessionId, searchFilters);
        return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving health systems:", error);
        return ResponseHandler.handleError(500, null, error);
    }
}; 