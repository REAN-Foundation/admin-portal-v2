import type { CarePlanSchedulingCreateModel } from "$lib/types/careplan.scheduling.types";
import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { createOrUpdatSchedulingeSchema } from "$lib/validation/careplan.scheduling.schema";
import { createCarePlanActivity } from "$routes/api/services/careplan/scheduling";

//////////////////////////////////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    try {
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }
        const carePlanId = event.url.searchParams.get("careplanId");
        const request = event.request;
        const data: CarePlanSchedulingCreateModel = await request.json();

        const validationResult = createOrUpdatSchedulingeSchema.safeParse(data);
        if (!validationResult.success) {
            return ResponseHandler.success({
                Status: 'failure',
                HttpCode: 400,
                Message: 'Validation failed',
                Errors: Object.fromEntries(Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
            });
        }

        const response = await createCarePlanActivity(sessionId, data.AssetType, data.AssetId, carePlanId, data.ScheduleDay, data.TimeSlot, data.Sequence);

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating health systems:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};