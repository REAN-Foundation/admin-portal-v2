import type { GoalsCreateModel } from "$lib/types/goals";
import { ResponseHandler } from "$lib/utils/response.handler";
import { createOrUpdateSchema } from "$lib/validation/goals.schema";
import { createGoals } from "$routes/api/services/careplan/assets/goals";
import type { RequestEvent } from "@sveltejs/kit";


export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside goals POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        const request = event.request;
        const data: GoalsCreateModel = await request.json();

        console.log("data", data);
        const validationResult = createOrUpdateSchema.safeParse(data);
        if (!validationResult.success) {
            return ResponseHandler.success({
                Status: 'failure',
                HttpCode: 400,
                Message: 'Validation failed',
                Errors: Object.fromEntries(Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
            });
        }

        const response = await createGoals(
            sessionId,
            data.Name,
            data.Description,     
            data.Tags,
            data.Version,
            data.TenantId
            );

        return ResponseHandler.success(response);
    } catch (error) {
        console.error("Error creating challenges:", error);
        return ResponseHandler.handleError(500, null, error);
    }
};

