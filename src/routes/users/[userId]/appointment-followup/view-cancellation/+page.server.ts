import type { ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { viewCancellations } from "$routes/api/services/follow-up/reminders";

///////////////////////////////////////////////////////////////////////////////
export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const tenatCode = event.locals.sessionUser.tenantCode;
    const tenantName = event.locals.sessionUser.tenantName;
    console.log('tenatCode', tenatCode);
    console.log('tenantName', tenantName);

    const searchParams = {
        tenantName: tenantName,
        orderBy: "CancelDate",
        order: "ascending",
        itemsPerPage: 10
    }
    const response = await viewCancellations(sessionId, searchParams);
    const appointmentCancellationRecords = response?.Data.FollowUpCancellation || [];

    return {
        appointmentCancellationRecords,
        sessionId,
        message: response?.Message || 'Appointment cancellation records retrieved successfully',
        title:''
    };
        
};


