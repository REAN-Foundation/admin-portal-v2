import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchCourses } from "$routes/api/services/reancare/educational/course";

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const searchFilters = createSearchFilters(event, {
            name: event.url.searchParams.get("name") ?? undefined,
            learningPathId: event.url.searchParams.get("learningPathId") ?? undefined,
        });

        console.log("Search Parameters:", searchFilters);
        const response = await searchCourses(sessionId, searchFilters);
        return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving courses:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

