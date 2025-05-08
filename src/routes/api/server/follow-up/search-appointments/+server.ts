import { ResponseHandler } from '$lib/utils/response.handler';
import { searchReportData } from '$routes/api/services/follow-up/reminders';
import type { RequestEvent } from '@sveltejs/kit';

///////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
    try {
        const tenantCode = event.locals?.sessionUser?.sessionId;
        const searchParams: URLSearchParams = event.url.searchParams;
        const searchFilters = {
            startDate: searchParams.get('startDate') ?? undefined,
            endDate: searchParams.get('endDate') ?? undefined
        };
        const appointmentDate = searchParams.get('appointmentDate') ?? undefined;
        console.log('Search Parameters:', searchFilters);
        const response = await searchReportData(tenantCode, appointmentDate, searchFilters);
        return ResponseHandler.success(response);
    } catch (error) {
        console.error('Error retrieving appointments:', error);
        return ResponseHandler.handleError(500, null, error);
    }
};