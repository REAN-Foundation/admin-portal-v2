import { ResponseHandler } from "$lib/utils/response.handler";
import { createSearchFilters } from "$lib/utils/search.utils";
import { searchEnrollments } from "$routes/api/services/careplan/enrollments";
import type { RequestEvent } from "@sveltejs/kit";

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const searchFilters = createSearchFilters(event, {
            // useTenantCode: true,
            careplanId: event.url.searchParams.get('carePlan') ?? undefined,
            displayId: event.url.searchParams.get("displayId") ?? undefined,
            startDate: event.url.searchParams.get("startDate") ?? undefined,
            endDate: event.url.searchParams.get("endDate") ?? undefined,
        });

        const response = await searchEnrollments(sessionId, searchFilters);
        return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving enrollments:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
