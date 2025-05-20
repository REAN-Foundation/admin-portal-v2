import type { ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { searchReportData } from "$routes/api/services/follow-up/reminders";

///////////////////////////////////////////////////////////////////////////////
export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const tenatCode = event.locals.sessionUser.tenantCode;
    console.log('tenatCode', tenatCode);

    const date = new Date();
    const dateString = date.toISOString().split('T')[0];
    const searchParams = {
        appointment_date: dateString,
        order_by: 'appointment_date',
        order: 'ascending',
        items_per_page: 10
    }
    const response = await searchReportData(tenatCode, searchParams);
    const appointmentRecords = response?.Data || [];
    console.log("Appointment Records==>",appointmentRecords);

    return {
        appointmentRecords,
        sessionId,
        message: response?.Message || 'Appointment records retrieved successfully',
        title:''
    };
        
};


