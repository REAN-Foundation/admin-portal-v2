import type { RequestEvent } from '@sveltejs/kit';
import { searchAssessmentTemplates } from '../../../../services/reancare/assessments/assessment-templates';
import { ResponseHandler } from '$lib/utils/response.handler';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const searchParams: URLSearchParams = event.url.searchParams;
		const searchFilters = {
			title: searchParams.get("name") ?? undefined,
			type: searchParams.get('type') ?? undefined,
			tags: searchParams.get('tags') ?? undefined,
			orderBy: searchParams.get("sortBy") ?? "CreatedAt",
			order: searchParams.get("sortOrder") ?? "ascending",
			itemsPerPage: parseInt(searchParams.get("itemsPerPage") ?? "10"),
			pageIndex: parseInt(searchParams.get("pageIndex") ?? "0"),
		};

		console.log('Search parms: ', searchParams);
		const response = await searchAssessmentTemplates(sessionId, searchFilters);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error("Error retriving assessment templates:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};
