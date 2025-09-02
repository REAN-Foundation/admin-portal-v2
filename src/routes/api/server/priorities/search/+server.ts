import type { RequestEvent } from '@sveltejs/kit';
import { searchPriorities } from '../../../services/reancare/priorities';
import { ResponseHandler } from "$lib/utils/response.handler";
import { createSearchFilters } from '$lib/utils/search.utils';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const searchFilters = createSearchFilters(event, {
			type: event.url.searchParams.get("type") ?? undefined,
			tags: event.url.searchParams.get("tags") ?? undefined,
		});

		console.log("Search Parameters:", searchFilters);
		const response = await searchPriorities(sessionId, searchFilters);
		return ResponseHandler.success(response);

	} catch (error) {
		console.error("Error retrieving priorities type:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};
