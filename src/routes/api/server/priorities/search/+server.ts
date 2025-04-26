import type { RequestEvent } from '@sveltejs/kit';
import { searchPriorities } from '../../../services/rean-care/priorities';
import { ResponseHandler } from "$lib/utils/response.handler";

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const searchParams: URLSearchParams = event.url.searchParams;
		const searchFilters = {
			type: searchParams.get("type") ?? undefined,
			tags: searchParams.get("tags") ?? undefined,
         	orderBy: searchParams.get("sortBy") ?? "CreatedAt",
			order: searchParams.get("sortOrder") ?? "ascending",
			itemsPerPage: parseInt(searchParams.get("itemsPerPage") ?? "10"),
			pageIndex: parseInt(searchParams.get("pageIndex") ?? "0"),
		};

		console.log("Search Parameters:", searchFilters);
		const response = await searchPriorities(sessionId, searchFilters);
		return ResponseHandler.success(response);

	} catch (error) {
		console.error("Error retrieving priorities type:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};
