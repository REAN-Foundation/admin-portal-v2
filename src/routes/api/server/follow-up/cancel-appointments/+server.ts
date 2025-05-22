import { ResponseHandler } from "$lib/utils/response.handler";
import { cancelAppointments as cancelAppointments } from '$routes/api/services/follow-up/reminders';
import { appointmentCancelSchema } from "$lib/validation/follow-up/reminder.schema";
import type { AppointmentCancelModel } from "$lib/types/follow-up/followup.upload";
import { redirect } from "sveltekit-flash-message/server";
import type { RequestEvent } from "@sveltejs/kit";
import { successMessage } from "$lib/utils/message.utils";

///////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside cancel appointmentr POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;
        const tenantId = event.locals?.sessionUser.tenantId;
        const tenantName = event.locals?.sessionUser.tenantName;
        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data:AppointmentCancelModel  = await request.json();

        console.log("data", data);
        const validationResult = appointmentCancelSchema.safeParse(data);
        if (!validationResult.success) {
            return ResponseHandler.success({
                Status: 'failure',
                HttpCode: 400,
                Message: 'Validation failed',
                Errors: Object.fromEntries(Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
            });
        }

        const dates = data.Dates
        let response;
         if (dates) {
      
            let unscheduled:any[] = []
            for (const date of dates) {
              response = await cancelAppointments(sessionId, data.Dates, tenantId, tenantName, data.Message);
              if(response.Status !== 'success'){
                unscheduled.push(date)
                // throw redirect(errorMessage(res.Message), event);
              }
            }
            console.log(typeof unscheduled)
            console.log("unscheduled.lenght",unscheduled.length);
            if (unscheduled.length === 0)
              {
                let message = `Cancellation scheduled`
                throw redirect(successMessage(message), event)
               }
              else{
                let note = `Follow-up cancellation was already done for ${unscheduled} and for remaining dates cancellation scheduled successfully!`
                throw redirect(successMessage(note), event)
              }
          }

        // const response = await cancelAppointments(sessionId, data.Dates, tenantId, tenantName, data.Message);
        // console.log("response====", response)
        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error in reminder cancellation:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};