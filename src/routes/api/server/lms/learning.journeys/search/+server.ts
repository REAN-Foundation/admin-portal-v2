import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { searchLearningJourneys } from "$routes/api/services/lms/learning.journeys";

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

		const searchParams = event.url.searchParams;
		const tenantId = event.locals?.sessionUser?.tenantId;
		const userRole = event.locals?.sessionUser?.roleName;
		const isSystemAdmin = userRole === 'System admin' || userRole === 'System user';

		const itemsPerPage = parseInt(searchParams.get('itemsPerPage') ?? '10');
		const pageIndex = parseInt(searchParams.get('pageIndex') ?? '0');
		
		const searchFilters: Record<string, any> = {
			orderBy: searchParams.get('orderBy') ?? searchParams.get('sortBy') ?? 'CreatedAt',
			order: searchParams.get('order') ?? searchParams.get('sortOrder') ?? 'ascending',
			itemsPerPage: Number.isFinite(itemsPerPage) ? itemsPerPage : 10,
			pageIndex: Number.isFinite(pageIndex) ? pageIndex : 0,
			name: searchParams.get("name") ?? undefined,
		};

		if (tenantId && !isSystemAdmin) {
			searchFilters.tenantId = tenantId;
		}

        const response = await searchLearningJourneys(sessionId, searchFilters);
        return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving learning paths:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

