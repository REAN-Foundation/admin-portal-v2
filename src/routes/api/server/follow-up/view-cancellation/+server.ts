import { ResponseHandler } from '$lib/utils/response.handler';
import { viewCancellations } from '$routes/api/services/follow-up/reminders';
import type { RequestEvent } from '@sveltejs/kit';

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		const tenantCode = event.locals?.sessionUser?.tenantCode;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}
		const searchParams: URLSearchParams = event.url.searchParams;
		const searchFilters = {
			tenant_code: tenantCode,
			from_date: searchParams.get('fromDate') ?? undefined,
			to_date: searchParams.get('toDate') ?? undefined,
			order_by: searchParams.get("sortBy") ?? "cancel_date",
            order: searchParams.get("sortOrder") ?? "ascending",
            items_per_page: parseInt(searchParams.get("itemsPerPage") ?? "10"),
            page_index: parseInt(searchParams.get("pageIndex") ?? "0"),
		};

		console.log('Search Parameters:', searchFilters);
		const response = await viewCancellations(sessionId, searchFilters);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error retrieving health systems:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
