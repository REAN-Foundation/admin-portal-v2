import { ResponseHandler } from '$lib/utils/response.handler';
import { searchReportData } from '$routes/api/services/follow-up/reminders';
import type { RequestEvent } from '@sveltejs/kit';

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    try {
        const tenantCode = event.locals?.sessionUser?.tenantCode;
        const searchParams: URLSearchParams = event.url.searchParams;
        const searchFilters = {
            tenant_code: tenantCode,
            appointment_date: searchParams.get('appointmentDate') ?? undefined ,
            replied_status: searchParams.get('repliedStatus') ?? undefined,
            order_by: searchParams.get('sortBy'),
			order: searchParams.get('sortOrder') ?? 'ascending',
			items_per_page: parseInt(searchParams.get('itemsPerPage') ?? '10'),
			page_index: parseInt(searchParams.get('pageIndex') ?? '0')
        };
        // const appointmentDate = searchParams.get('appointmentDate') ?? undefined;
        console.log('Search Parameters:', searchFilters);
        const response = await searchReportData(tenantCode, searchFilters);
        return ResponseHandler.success(response);
    } catch (error) {
        console.error('Error retrieving appointments:', error);
        return ResponseHandler.handleError(500, null, error);
    }
};