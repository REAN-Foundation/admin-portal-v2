import { ResponseHandler } from "$lib/utils/response.handler";
import { searchChallenges } from "$routes/api/services/careplan/assets/challenges";
import type { RequestEvent } from "@sveltejs/kit";

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const searchParams: URLSearchParams = event.url.searchParams;
        const searchFilters: Record<string, string> = {
                    name: searchParams.get('name') ?? '',
                    code: searchParams.get('code') ?? '',
                    orderBy: searchParams.get('sortBy') ?? 'CreatedAt',
                    order: searchParams.get('sortOrder') ?? 'ascending',
                    itemsPerPage: parseInt(searchParams.get('itemsPerPage') ?? '10').toString(),
                    pageIndex: parseInt(searchParams.get('pageIndex') ?? '0').toString()       
                };
        
                console.log('Search Parameters:', searchFilters);
                const response = await searchChallenges(sessionId, searchFilters);
        return ResponseHandler.success(response);

    } catch (error) {
        console.error("Error retrieving challenges:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};
