import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { createSearchFilters } from '$lib/utils/search.utils';
import { searchEnrollments } from "$routes/api/services/lms/enrollments";

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const searchParams = event.url.searchParams;
		const additionalFilters: Record<string, any> = {
			userId: searchParams.get("userId") ?? undefined,
			tenantId: searchParams.get("tenantId") ?? undefined,
			courseId: searchParams.get("courseId") ?? undefined,
			learningPathId: searchParams.get("learningPathId") ?? undefined,
			courseName: searchParams.get("courseName") ?? undefined,
			learningPathName: searchParams.get("learningPathName") ?? undefined,
			displayId: searchParams.get("displayId") ?? undefined,
			startDate: searchParams.get("startDate") ?? undefined,
			endDate: searchParams.get("endDate") ?? undefined,
			isActive: searchParams.get("isActive") ?? undefined
		};
		
		const orderBy = searchParams.get("orderBy");
		const order = searchParams.get("order");
		if (orderBy) additionalFilters.orderBy = orderBy;
		if (order) additionalFilters.order = order;
		
		const searchFilters = createSearchFilters(event, additionalFilters);
		
		const response = await searchEnrollments(sessionId, searchFilters);
		return ResponseHandler.success(response);

	} catch (error) {
		console.error("Error retrieving enrollments:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};

