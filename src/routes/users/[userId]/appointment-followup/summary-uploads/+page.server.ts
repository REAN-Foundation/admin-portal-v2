import type { ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { searchReportData } from "$routes/api/services/follow-up/reminders";

///////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const tenatCode = event.locals.sessionUser.tenantCode;
    event.depends('app:healthSystem');
    const date = new Date();
    const dateString = date.toISOString().split('T')[0];
    const response = await searchReportData(tenatCode, dateString);
    const appointmentRecords = response?.Data || [];
    console.log("appointmentRecords==>",appointmentRecords);

    return {
        appointmentRecords,
        sessionId,
        message: response?.Message || 'Appointment records retrieved successfully',
        title:''
    };
        
};


