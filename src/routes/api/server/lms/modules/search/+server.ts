import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchModules } from "$routes/api/services/lms/modules";

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const searchFilters = createSearchFilters(event, {
            name: event.url.searchParams.get("name") ?? undefined,
            courseId: event.url.searchParams.get("courseId") ?? undefined,
            durationInMins: event.url.searchParams.get("durationInMins") ? parseFloat(event.url.searchParams.get("durationInMins")) : undefined,
        });

        console.log("Search Parameters:", searchFilters);
        const response = await searchModules(sessionId, searchFilters);
        return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving modules:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

