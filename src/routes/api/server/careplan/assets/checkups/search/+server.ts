import { ResponseHandler } from "$lib/utils/response.handler";
import { searchCheckups } from "$routes/api/services/careplan/assets/checkups";
import type { RequestEvent } from "@sveltejs/kit";
import { createSearchFilters } from '$lib/utils/search.utils';

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const searchFilters = createSearchFilters(event, {
            name: event.url.searchParams.get('name') ?? undefined,
            code: event.url.searchParams.get('code') ?? undefined,
        });
        
        console.log('Search Parameters:', searchFilters);
        const response = await searchCheckups(sessionId, searchFilters);
        return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving checkups:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
