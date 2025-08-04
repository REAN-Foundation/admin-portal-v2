import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { searchCareplan } from "$routes/api/services/careplan/careplans";
import { createSearchFilters } from '$lib/utils/search.utils';

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        				const searchFilters = createSearchFilters(event, {
			name: event.url.searchParams.get("name") ?? undefined,
			code: event.url.searchParams.get("code") ?? undefined,
		});

		console.log('Careplan search filters:', searchFilters);
		console.log('Careplan search URL params:', {
			name: event.url.searchParams.get("name"),
			code: event.url.searchParams.get("code")
		});

		const response = await searchCareplan(sessionId, searchFilters);
		console.log('Careplan search response:', response);
		return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving careplans:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
