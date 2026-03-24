import { ResponseHandler } from "$lib/utils/response.handler";
import { createSearchFilters } from "$lib/utils/search.utils";
import { searchEnrollmentTask } from "$routes/api/services/careplan/enrollment.task";
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
            assetType: event.url.searchParams.get("assetType") ?? undefined,
            careplanId: event.url.searchParams.get("careplanId") ?? undefined,
            enrollmentId: event.url.searchParams.get("enrollmentId") ?? undefined,
        });

        const response = await searchEnrollmentTask(sessionId, searchFilters);
        return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving enrollments task:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
