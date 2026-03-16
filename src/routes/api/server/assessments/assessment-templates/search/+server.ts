import type { RequestEvent } from '@sveltejs/kit';
import { searchAssessmentTemplates } from '../../../../services/reancare/assessments/assessment-templates';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createSearchFilters } from '$lib/utils/search.utils';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const tenantIdParam = event.url.searchParams.get("tenantId") ?? undefined;

		const searchFilters = createSearchFilters(event, {
			title: event.url.searchParams.get("title") ?? undefined,
			type: event.url.searchParams.get('type') ?? undefined,
			tags: event.url.searchParams.get('tags') ?? undefined,
		});

		// Allow System Admin to explicitly filter by tenantId via query param
		if (tenantIdParam) {
			searchFilters.tenantId = tenantIdParam;
		}

		console.log('Search Parameters:', searchFilters);
		const response = await searchAssessmentTemplates(sessionId, searchFilters);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error("Error retrieving assessment templates:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};
