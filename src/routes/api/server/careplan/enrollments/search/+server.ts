import { ResponseHandler } from "$lib/utils/response.handler";
import { searchEnrollments } from "$routes/api/services/careplan/enrollments";
import type { RequestEvent } from "@sveltejs/kit";

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const searchParams: URLSearchParams = event.url.searchParams;
        const searchFilters = {
            careplanId: searchParams.get('carePlan') ?? undefined,
            displayId: searchParams.get("displayId") ?? undefined,
            startDate: searchParams.get("startDate") ?? undefined,
            endDate: searchParams.get("endDate") ?? undefined,
            orderBy: searchParams.get("sortBy") ?? "CreatedAt",
            order: searchParams.get("sortOrder") ?? "ascending",
            itemsPerPage: parseInt(searchParams.get("itemsPerPage") ?? "10"),
            pageIndex: parseInt(searchParams.get("pageIndex") ?? "0"),
        };

        console.log("Search Parameters--------:", searchFilters);
        const response = await searchEnrollments(sessionId, searchFilters);
        return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving enrollments:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
