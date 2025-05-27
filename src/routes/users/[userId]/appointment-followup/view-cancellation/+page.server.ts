import type { ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { viewCancellations } from "$routes/api/services/follow-up/reminders";

///////////////////////////////////////////////////////////////////////////////
export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const tenantCode = event.locals.sessionUser.tenantCode;
    const  tenantName = event.locals.sessionUser.tenantName;
    console.log('tenatCode', tenantCode);
    console.log('tenantName', tenantName);

    const searchParams = {
        tenant_code: tenantCode,
        order_by: "cancel_date",
        order: "ascending",
        itemsPerPage: 10
    }
    const response = await viewCancellations(sessionId, searchParams);
    console.log('response', response);
    const appointmentCancellationRecords = response?.Data || [];

    return {
        appointmentCancellationRecords,
        sessionId,
        message: response?.Message || 'Appointment cancellation records retrieved successfully',
        title:''
    };
        
};


