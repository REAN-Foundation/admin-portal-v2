import type { RequestEvent } from '@sveltejs/kit';
import { searchAssessmentNodes } from '../../../../services/reancare/assessments/assessment-nodes';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createSearchFilters } from '$lib/utils/search.utils';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const templateId = event.url.searchParams.get('templateId');
		const searchFilters = createSearchFilters(event, {
			templateId,
			title: event.url.searchParams.get("title") ?? undefined,
			nodeType: event.url.searchParams.get('nodeType') ?? undefined,
			tags: event.url.searchParams.get('tags') ?? undefined,
		});

		console.log('Search Parameters:', searchFilters);
		const response = await searchAssessmentNodes(sessionId, searchFilters);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error("Error retrieving assessment nodes:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};
