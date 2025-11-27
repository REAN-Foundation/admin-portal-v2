import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchContents } from "$routes/api/services/reancare/educational/content";

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const searchFilters = createSearchFilters(event, {
            title: event.url.searchParams.get("title") ?? undefined,
            contentType: event.url.searchParams.get("contentType") ?? undefined,
            courseModuleId: event.url.searchParams.get("moduleId") ?? undefined,
        });

        console.log("Search Parameters:", searchFilters);
        const response = await searchContents(sessionId, searchFilters);
        return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving contents:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

